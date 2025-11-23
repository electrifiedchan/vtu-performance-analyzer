import fitz
import re
import json
import sys
import requests
import os
import traceback
from dotenv import load_dotenv

load_dotenv()

CREDITS_MAP = {
    'BCS401': 3, 'BCS402': 4, 'BCS403': 4, 'BCSL404': 1, 'BBOC407': 2,
    'BUHK408': 1, 'BPEK459': 0, 'BCS405A': 3, 'BDSL456B': 1, 'BCSL405': 1, 'BCSL406': 1,
}


def get_grade_points(total_marks, result_status):
    if result_status == 'F':
        return 0
    try:
        total_marks = int(total_marks)
    except (ValueError, TypeError):
        return 0
    if 90 <= total_marks <= 100: return 10
    elif 80 <= total_marks <= 89: return 9
    elif 70 <= total_marks <= 79: return 8
    elif 60 <= total_marks <= 69: return 7
    elif 55 <= total_marks <= 59: return 6
    elif 50 <= total_marks <= 54: return 5
    elif 40 <= total_marks <= 49: return 4
    else: return 0


def test_grade_logic():
    print("Running grade logic unit tests...")
    try:
        assert get_grade_points(100, 'P') == 10
        assert get_grade_points(89, 'P') == 9
        assert get_grade_points(39, 'P') == 0
        assert get_grade_points(95, 'F') == 0
        print("✓ All grade logic tests passed!")
    except AssertionError as e:
        print(f"✗ CRITICAL: Grade logic test failed! Error: {e}")
        sys.exit(1)


def extract_text_with_ocrspace(doc):
    """Extract text from PDF using ocr.space API."""
    print("--- Starting OCR.space extraction ---")
    full_text = ""
    api_key = os.getenv("OCR_SPACE_API_KEY")
    
    if not api_key:
        raise ValueError("OCR_SPACE_API_KEY not found in .env file")
        
    url = "https://api.ocr.space/parse/image"
    
    for i, page in enumerate(doc):
        print(f"Processing page {i+1} with OCR.space...")
        
        pix = page.get_pixmap(dpi=300)
        img_data = pix.tobytes("png")
        
        try:
            response = requests.post(
                url,
                files={'file': ('scan.png', img_data, 'image/png')},
                data={'apikey': api_key, 'language': 'eng'},
                timeout=60
            )
            
            response.raise_for_status()
            api_result = response.json()

            if api_result.get('IsErroredOnProcessing'):
                print(f"❌ API Error: {api_result.get('ErrorMessage')}")
                raise Exception(f"OCR.space Error: {api_result.get('ErrorMessage')}")

            if api_result.get('ParsedResults'):
                page_text = api_result['ParsedResults'][0]['ParsedText']
                print(f"  ✓ Extracted {len(page_text)} characters from page {i+1}")
                full_text += page_text + "\n"
            else:
                print(f"  ✗ No text found on page {i+1}")

        except requests.exceptions.RequestException as e:
            print(f"❌ API Request Failed for page {i+1}: {e}")
            raise
            
    print("--- OCR.space complete ---")
    return full_text


def parse_ocr_text(full_text):
    """
    Parse OCR.space output - works with flexible formatting.
    """
    print("--- Running OCR Parser ---")
    subjects = []
    
    try:
        # DEBUG: Print first 500 chars to see structure
        print(f"OCR Output (first 500 chars):\n{full_text[:500]}\n")
        
        # --- FIX 1: More flexible subject pattern ---
        # Works with: CODE NAME INT EXT TOTAL (on same or different lines)
        subject_pattern = re.compile(
            r"([A-Z]{3,}\d{3}[A-Z]?)"  # 1: Code
            r"\s+"
            r"(.+?)"                    # 2: Name (can have spaces/newlines)
            r"\s+"
            r"(\d{1,2})"                # 3: Internal (1-2 digits)
            r"\s+"
            r"(\d{1,2})"                # 4: External (1-2 digits)
            r"\s+"
            r"(\d{2,3})",               # 5: Total (2-3 digits)
            re.DOTALL
        )
        
        subject_matches = subject_pattern.findall(full_text)
        print(f"  Found {len(subject_matches)} subjects")
        
        # --- FIX 2: More flexible Result pattern ---
        # Just find all P/F letters (they appear in a column)
        results = re.findall(r'\b([PF])\b', full_text)
        print(f"  Found {len(results)} results")
        
        # --- FIX 3: Debug output ---
        if subject_matches:
            print(f"  First subject: {subject_matches[0]}")
        if results:
            print(f"  Results list: {results[:10]}")
        
        # --- FIX 4: Handle mismatch gracefully ---
        if not subject_matches:
            print("⚠️  No subjects found. Trying alternative parsing...")
            return parse_ocr_text_alternative(full_text)
        
        # Use only as many results as subjects
        results = results[:len(subject_matches)]
        
        if not results:
            print("⚠️  No results (P/F) found. Assuming all PASS...")
            results = ['P'] * len(subject_matches)
        
        if len(subject_matches) != len(results):
            print(f"⚠️  Mismatch: {len(subject_matches)} subjects but {len(results)} results")
            print(f"    Using first {min(len(subject_matches), len(results))} entries")
        
        # Process subjects
        for i in range(min(len(subject_matches), len(results))):
            match = subject_matches[i]
            result = results[i]
            
            try:
                code = match[0].strip()
                title = match[1].strip().replace("\n", " ").replace("  ", " ")
                internal = int(match[2])
                external = int(match[3])
                total = int(match[4])
                
                # Validate marks
                if internal > 50 or external > 50 or total > 100:
                    print(f"⚠️  Skipping {code} - marks seem invalid (I:{internal} E:{external} T:{total})")
                    continue
                
                credits = CREDITS_MAP.get(code, 0)
                points = get_grade_points(total, result)
                
                subjects.append({
                    "code": code,
                    "title": title,
                    "internal": internal,
                    "external": external,
                    "total": total,
                    "result": result,
                    "credits": credits,
                    "points": points
                })
                
            except Exception as e:
                print(f"⚠️  Error processing subject {i}: {e}")
                continue
        
        return subjects if subjects else None

    except Exception as e:
        print(f"❌ Error in parse_ocr_text: {e}")
        traceback.print_exc()
        return None


def parse_ocr_text_alternative(full_text):
    """Alternative parser if main parser fails."""
    print("  Trying alternative parsing...")
    subjects = []
    
    # Split by lines and look for subject-like patterns
    lines = full_text.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Look for a line starting with subject code
        if re.match(r'^[A-Z]{3,}\d{3}', line):
            match = re.search(r'([A-Z]{3,}\d{3}[A-Z]?)\s+(.+)', line)
            if match:
                code = match.group(1)
                rest = match.group(2)
                
                # Look for marks in next lines
                marks_match = re.search(r'(\d{1,2})\s+(\d{1,2})\s+(\d{2,3})', rest)
                if marks_match:
                    internal = int(marks_match.group(1))
                    external = int(marks_match.group(2))
                    total = int(marks_match.group(3))
                    
                    # Look for P/F
                    pf_match = re.search(r'([PF])', rest)
                    result = pf_match.group(1) if pf_match else 'P'
                    
                    credits = CREDITS_MAP.get(code, 0)
                    points = get_grade_points(total, result)
                    
                    subjects.append({
                        "code": code,
                        "title": f"Subject {code}",
                        "internal": internal,
                        "external": external,
                        "total": total,
                        "result": result,
                        "credits": credits,
                        "points": points
                    })
        
        i += 1
    
    return subjects if subjects else None


def parse_marks_card(pdf_file_path):
    """Parse marks card PDF."""
    full_text = ""
    doc = None
    
    try:
        doc = fitz.open(pdf_file_path)
        print(f"✓ Opened PDF with {doc.page_count} pages")
        
        # Digital extraction
        for page in doc:
            full_text += page.get_text()
        
        print(f"✓ Digital extraction: {len(full_text)} characters")
        
        is_ocr = False
        if len(full_text.strip()) < 200:
            is_ocr = True
            print(f"⚠️  Digital text minimal. Using OCR.space...")
            full_text = extract_text_with_ocrspace(doc)
        
        print(f"✓ Total extracted: {len(full_text)} characters")
        
        if len(full_text.strip()) < 100:
            return {"status": "error", "message": "Could not extract text from PDF."}
        
        # Extract USN and Name
        usn_pattern = re.compile(r"University Seat Number\s*:?\s*(\w+)", re.IGNORECASE)
        name_pattern = re.compile(r"Student Name\s*:?\s*(.+?)(?:\n|$)", re.IGNORECASE)
        
        usn_search = usn_pattern.search(full_text)
        name_search = name_pattern.search(full_text)
        
        if not usn_search:
            return {"status": "error", "message": "Could not find USN."}
        if not name_search:
            return {"status": "error", "message": "Could not find Name."}
        
        usn = usn_search.group(1).strip()
        name = name_search.group(1).strip()
        
        # Parse subjects
        subjects = []
        
        if is_ocr:
            subjects = parse_ocr_text(full_text)
        else:
            print("--- Running Digital Parser ---")
            subject_pattern = re.compile(
                r"([A-Z]{3,}\d{3}[A-Z]?)\s+(.+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+([PF])\s*",
                re.DOTALL | re.MULTILINE
            )
            subject_matches = subject_pattern.findall(full_text)
            
            for match in subject_matches:
                code = match[0].strip()
                credits = CREDITS_MAP.get(code, 0)
                points = get_grade_points(int(match[4]), match[5].strip())
                subjects.append({
                    "code": code,
                    "title": match[1].strip().replace("\n", " "),
                    "internal": int(match[2]),
                    "external": int(match[3]),
                    "total": int(match[4]),
                    "result": match[5].strip(),
                    "credits": credits,
                    "points": points
                })
        
        if not subjects:
            return {"status": "error", "message": "Could not find subjects."}
        
        print(f"✓ Found {len(subjects)} subjects")
        
        # Calculate SGPA
        total_credits_attempted = sum(s['credits'] for s in subjects)
        total_grade_points_earned = sum(s['points'] * s['credits'] for s in subjects)
        
        sgpa = 0.0
        if total_credits_attempted > 0:
            sgpa = round(total_grade_points_earned / total_credits_attempted, 2)
        
        percentage = round(sgpa * 10, 2)
        percentage = max(0, min(100, percentage))
        
        return {
            "status": "success",
            "usn": usn,
            "name": name,
            "sgpa": sgpa,
            "percentage": percentage,
            "total_credits_attempted": total_credits_attempted,
            "total_grade_points_earned": round(total_grade_points_earned, 2),
            "subjects": subjects
        }
    
    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
    
    finally:
        if doc:
            try:
                doc.close()
            except:
                pass


if __name__ == "__main__":
    test_grade_logic()
    print("\n✓ parser.py ready!")
