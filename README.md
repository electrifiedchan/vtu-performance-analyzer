# Smart SGPA/CGPA Calculator & AI Consultant

<div align="center">

![VTU Banner](https://img.shields.io/badge/VTU-Smart%20Analytics-blue?style=for-the-badge&logo=google-scholar&logoColor=white)

**"From PDF to Prediction"**

🚀 *A full-stack academic intelligence engine that parses result PDFs, calculates SGPA/CGPA, and uses Google Gemini AI to predict performance and offer study advice.*

<br/>

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Analysis-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-Prediction-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![PyMuPDF](https://img.shields.io/badge/PyMuPDF-PDF%20Parsing-FF0000?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](https://pymupdf.readthedocs.io/)

</div>

---

## 🎯 Overview

Manual SGPA calculation is tedious and doesn't tell you how to improve.

**Smart SGPA Calculator** is a full-stack application that automates the entire academic workflow:
1.  **Ingest:** Upload your official VTU Result PDF.
2.  **Parse:** The Python backend extracts marks, subject codes, and credits automatically.
3.  **Analyze:** Calculates precise SGPA and CGPA based on the official 2022 Scheme.
4.  **Predict:** Uses Machine Learning (Linear Regression) to forecast your next semester's performance.
5.  **Consult:** Sends your data to **Google Gemini AI** to get personalized study tips for weak subjects.

---

## ⚙️ How It Works (The Core Logic)

### 1. The Parser Engine (`backend/parser.py`)
Instead of manual entry, we built a custom parser using **PyMuPDF** and **Regex**:
* **Extraction:** Scrapes the PDF for Subject Codes (e.g., `BCS401`), Marks, and Results.
* **Credit Mapping:** Automatically maps subject codes to their VTU credit values.
* **Logic:** Applies the weighted formula: $\frac{\sum (Credits \times Grade Points)}{\sum Total Credits}$.

### 2. The AI & ML Core (`backend/app.py`)
* **Future Prediction:** A **Scikit-Learn** Linear Regression model analyzes your past SGPA trend to predict your next semester's grade.
* **AI Study Advisor:** Integrates **Google Gemini 2.5 Flash**. It analyzes your failed or low-scoring subjects and generates a specific, actionable recovery plan.

---

## 🚀 Key Features

* **📄 Drag & Drop Parsing:** No manual data entry. Just drop your result PDF.
* **🤖 AI-Powered Advice:** "How do I clear Maths?" -> Gemini answers based on your marks.
* **📈 Trend Visualization:** Interactive charts (Chart.js) showing your academic growth.
* **🔮 Grade Prediction:** "What if" analysis for future semesters.
* **🔒 Secure Processing:** PDFs are processed in-memory and deleted instantly.

---

## 🛠️ Tech Stack

### Frontend
* **React.js:** Dynamic user interface.
* **Chart.js:** Data visualization for trends.
* **Axios:** For connecting to the Python backend.

### Backend
* **Flask (Python):** REST API server.
* **PyMuPDF (Fitz):** PDF text extraction.
* **Google Gemini API:** Generative AI for study tips.
* **Scikit-Learn:** Machine learning for predictions.
* **Pandas:** Data structuring.

---

## ⚡ Quick Start Guide

### Prerequisites
* Python 3.10+
* Node.js 18+
* Google Gemini API Key

### 1. Clone the Repository
```bash
git clone [https://github.com/electrifiedchan/vtu-performance-analyzer.git](https://github.com/electrifiedchan/vtu-performance-analyzer.git)
cd vtu-performance-analyzer

### 2. Backend Setup

Navigate to the backend folder and install Python dependencies:

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install flask flask-cors pymupdf pandas scikit-learn requests python-dotenv

```

**Configuration:**
Create a `.env` file in `backend/` and add your key:

```env
GEMINI_API_KEY=your_actual_api_key_here

```

### 3. Frontend Setup

Open a new terminal, navigate to frontend, and start the UI:

```bash
cd frontend
npm install
npm start

```

### 4. Usage

1. **Start Server:** Run `python app.py` in the backend folder.
2. **Start UI:** Run `npm start` in the frontend folder.
3. **Upload:** Go to `localhost:3000` and upload your result PDF.

---

## 📂 Project Structure

```text
vtu-performance-analyzer/
├── backend/                # Flask API & Logic
│   ├── app.py              # Main Server, ML Model, Gemini Integration
│   ├── parser.py           # PDF Parsing & Regex Logic
│   ├── venv/               # Virtual Environment
│   └── .env                # Secrets (GitIgnored)
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # Charts, Upload Form
│   │   ├── pages/          # Dashboard View
│   │   └── App.js          # Main Component
│   └── package.json
└── README.md               # Documentation

```

---

<div align="center">

**"Data Science applied to Academic Success."**

Made with 💻 by [@electrifiedchan](https://github.com/electrifiedchan)

</div>

```

```
