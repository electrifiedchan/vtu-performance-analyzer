from parser import parse_marks_card # Import our new function from parser.py
import json

# --- IMPORTANT ---
# 1. Get a real marks card PDF file.
# 2. Save it inside this 'backend' folder (same place as this test.py file).
# 3. Change "YOUR_PDF_FILE.pdf" below to the real file name.
# -----------------
pdf_path = "4THSEM.pdf" 

# Run the engine!
results = parse_marks_card(pdf_path)

# Print the results in a clean format
print("--- PARSER RESULTS ---")
print(json.dumps(results, indent=2))
print("--- END OF RESULTS ---")