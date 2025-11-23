from flask import Flask, request, jsonify
from flask_cors import CORS
from parser import parse_marks_card
from werkzeug.utils import secure_filename
import tempfile
import os
import numpy as np
from sklearn.linear_model import LinearRegression
import requests
import json
from dotenv import load_dotenv # <-- NEW: Import dotenv

# --- NEW: Load our secret .env file ---
# This line reads your .env file and loads the variables
load_dotenv() 

app = Flask(__name__)
# Mobile access: Allow all origins (development only)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

ALLOWED_EXTENSIONS = {'pdf'}

# (allowed_file and calculate_cgpa_data are unchanged)
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculate_cgpa_data(past_sgpas_str, new_sgpa):
    try:
        past_sgpas = [float(s.strip()) for s in past_sgpas_str.split(',') if s.strip()]
        all_sgpas = past_sgpas + [new_sgpa]
        
        cgpa = 0
        if all_sgpas:
            cgpa = round(sum(all_sgpas) / len(all_sgpas), 2)
            
        percentage = round(cgpa * 10, 2)
        
        classification = "Second Class (SC)"
        if cgpa >= 7.75:
            classification = "First Class with Distinction (FCD)"
        elif cgpa >= 6.75:
            classification = "First Class (FC)"
            
        prediction = None
        if len(all_sgpas) >= 2:
            X = np.array(range(1, len(all_sgpas) + 1)).reshape(-1, 1)
            y = np.array(all_sgpas)
            model = LinearRegression()
            model.fit(X, y)
            next_sem_num = len(all_sgpas) + 1
            predicted_sgpa = model.predict(np.array([[next_sem_num]]))[0]
            predicted_sgpa = round(np.clip(predicted_sgpa, 0, 10), 2)
            new_sgpa_list = all_sgpas + [predicted_sgpa]
            predicted_cgpa = round(sum(new_sgpa_list) / len(new_sgpa_list), 2)
            prediction = {
                "past_trend": all_sgpas,
                "predicted_sgpa": predicted_sgpa,
                "predicted_cgpa": predicted_cgpa
            }
        return {
            "cgpa": cgpa,
            "percentage": percentage,
            "classification": classification,
            "prediction": prediction
        }
    except Exception as e:
        print(f"CGPA/Prediction error: {e}")
        return None

# (/ and /upload are unchanged)
@app.route("/")
def index():
    return jsonify({"status": "Flask API is running!"})

@app.route("/upload", methods=["POST"])
def upload_file():
    # ... (this whole function is unchanged)
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400
    file = request.files['file']
    past_sgpas_str = request.form.get('past_sgpas', '')
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"status": "error", "message": "Invalid or missing PDF file"}), 400
    temp_pdf_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            file.save(temp_file.name)
            temp_pdf_path = temp_file.name
        results = parse_marks_card(temp_pdf_path)
        if results["status"] == "error":
            return jsonify(results), 500
        if past_sgpas_str:
            cgpa_data = calculate_cgpa_data(
                past_sgpas_str, 
                results["sgpa"]
            )
            results.update(cgpa_data)
        return jsonify(results)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)

@app.route("/get-ai-tip", methods=["POST"])
def get_ai_tip():
    data = request.get_json()
    subjects = data.get('subjects')
    sgpa = data.get('sgpa')
    if not subjects:
        return jsonify({"status": "error", "message": "No subject data provided"}), 400
    try:
        passed_subjects = [s for s in subjects if s['result'] == 'P' and s['credits'] > 0]
        worst_subject = min(passed_subjects, key=lambda x: x['points'])
        failed_subjects = [s for s in subjects if s['result'] == 'F']
        
        prompt = (f"A VTU data science student just got their 4th sem results. "
                  f"Their SGPA was {sgpa}. ")
        if failed_subjects:
            prompt += (f"They failed: {', '.join([s['title'] for s in failed_subjects])}. "
                       f"Their worst *passed* subject was {worst_subject['title']} (Grade Points: {worst_subject['points']}). ")
            prompt += "Please provide one paragraph of concise, actionable study advice focusing on how to recover from the failed subjects and improve."
        else:
            prompt += (f"Their worst passed subject was {worst_subject['title']} (Grade Points: {worst_subject['points']}). "
                       f"Please provide one paragraph of concise, actionable study advice on how to improve this specific subject.")
    except Exception:
        prompt = f"A VTU data science student just got an SGPA of {sgpa}. Provide one paragraph of concise, positive study advice."

    try:
        # --- THIS IS THE FIX ---
        # It now reads your secret key from the .env file
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            # This error will show if your .env file is wrong
            return jsonify({"status": "error", "message": "API key not configured."}), 500
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key={api_key}"
        
        system_instruction = "You are a helpful and encouraging academic tutor for a data science engineering student."
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "systemInstruction": {"parts": [{"text": system_instruction}]}
        }
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(url, headers=headers, data=json.dumps(payload), timeout=20)
        response.raise_for_status() # This will raise an error if Google sends a 4xx or 5xx
        
        api_result = response.json()
        tip = api_result['candidates'][0]['content']['parts'][0]['text']
        return jsonify({"status": "success", "tip": tip})
        
    except requests.exceptions.Timeout:
        return jsonify({"status": "error", "message": "AI server (Gemini) timed out. Please try again."}), 504
    except requests.exceptions.RequestException as e:
        print(f"Gemini API Error: {e}")
        # This will now catch the 403 error if the key is wrong
        return jsonify({"status": "error", "message": f"AI server error: {e}"}), 500
    except (KeyError, IndexError):
        return jsonify({"status": "error", "message": "Failed to parse AI response."}), 500

if __name__ == "__main__":
    # Mobile access: Bind to all network interfaces
    app.run(host='0.0.0.0', port=5000, debug=True)