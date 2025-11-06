import fitz  # PyMuPDF
import re    # Regular Expressions
import json
import sys   # We'll use this to exit if tests fail

# --- 1. THE LOGIC YOU PROVIDED ---

# This is the "Credits Map" based on the OFFICIAL VTU SCHEME.
CREDITS_MAP = {
    'BCS401': 3,
    'BCS402': 4,
    'BCS403': 4,
    'BCSL404': 1,
    'BBOC407': 2,
    'BUHK408': 1,
    'BPEK459': 0,  # Non-credit
    'BCS405A': 3,
    'BDSL456B': 1,
    'BCSL405': 1,
    'BCSL406': 1,
}

# This function converts Total Marks -> Grade Points, based on your logic.
def get_grade_points(total_marks, result_status):
    """
    Converts total marks and pass/fail status into VTU grade points.
    """
    if result_status == 'F':
        return 0
    
    if 90 <= total_marks <= 100:
        return 10
    elif 80 <= total_marks <= 89:
        return 9
    elif 70 <= total_marks <= 79:
        return 8
    elif 60 <= total_marks <= 69:
        return 7
    elif 55 <= total_marks <= 59:
        return 6
    elif 50 <= total_marks <= 54:
        return 5
    elif 40 <= total_marks <= 49:
        return 4
    else:
        return 0

# --- 2. SELF-TESTING UNIT TEST ---
def test_grade_logic():
    """
    A simple unit test to verify the get_grade_points function.
    """
    print("Running grade logic unit tests...")
    try:
        assert get_grade_points(100, 'P') == 10
        assert get_grade_points(90, 'P') == 10
        assert get_grade_points(89, 'P') == 9
        assert get_grade_points(80, 'P') == 9
        assert get_grade_points(79, 'P') == 8
        assert get_grade_points(70, 'P') == 8
        assert get_grade_points(69, 'P') == 7
        assert get_grade_points(60, 'P') == 7
        assert get_grade_points(59, 'P') == 6
        assert get_grade_points(55, 'P') == 6
        assert get_grade_points(54, 'P') == 5
        assert get_grade_points(50, 'P') == 5
        assert get_grade_points(49, 'P') == 4
        assert get_grade_points(40, 'P') == 4
        assert get_grade_points(39, 'P') == 0
        assert get_grade_points(55, 'F') == 0 # Should be 0, not 6
        assert get_grade_points(95, 'F') == 0 # Should be 0, not 10
        print("✓ All grade logic tests passed!")
    except AssertionError:
        print("✗ CRITICAL: Grade logic test failed!")
        sys.exit(1) # Stop the script if logic is broken

# --- 3. THE PARSER FUNCTION ---
def parse_marks_card(pdf_file_path):
    """
    Parses a digital marks card PDF, extracts key information,
    and calculates SGPA using VTU 2022 scheme logic.
    """
    
    full_text = ""
    try:
        # --- A. EXTRACT ALL TEXT ---
        doc = fitz.open(pdf_file_path)
        for page in doc:
            full_text += page.get_text()
        doc.close()
        
        print(f"--- Extracted {len(full_text)} characters from PDF.")

        # --- B. FIND PATTERNS WITH ROBUST REGEX ---
        usn_pattern = re.compile(r"University Seat Number\s*:\s*(\w+)")
        name_pattern = re.compile(r"Student Name\s*:\s*(.+)")
        
        subject_pattern = re.compile(
            r"([A-Z]{3,}\d{3}[A-Z]?)\s*"  # 1: Subject Code
            r"(.+?)\s*"                  # 2: Subject Name
            r"(\d+)\s*"                  # 3: Internal Marks
            r"(\d+)\s*"                  # 4: External Marks
            r"(\d+)\s*"                  # 5: Total Marks
            r"([PF])\s*",                # 6: Result (P or F)
            re.DOTALL
        )

        usn = usn_pattern.search(full_text).group(1).strip()
        name = name_pattern.search(full_text).group(1).strip()

        subjects = []
        total_credits_attempted = 0
        total_grade_points_earned = 0
        
        subject_matches = subject_pattern.findall(full_text)
        print(f"--- Found {len(subject_matches)} subjects.")

        for match in subject_matches:
            code = match[0].strip()
            title = match[1].strip().replace("\n", " ")
            internal = int(match[2])
            external = int(match[3])
            total = int(match[4])
            result = match[5].strip()

            credits = CREDITS_MAP.get(code, 0)
            
            if code not in CREDITS_MAP:
                print(f"⚠️  Warning: Subject code '{code}' not found in CREDITS_MAP. Using 0 credits.")

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
            
            total_credits_attempted += credits
            total_grade_points_earned += (points * credits)
        
        # --- NPTEL LOGIC IS REMOVED (per our last discussion) ---

        # --- E. CALCULATE SGPA ---
        sgpa = 0.0
        if total_credits_attempted > 0:
            sgpa = round(total_grade_points_earned / total_credits_attempted, 2)

        # --- F. CALCULATE PERCENTAGE (NEW) ---
        percentage = (sgpa - 0.75) * 10
        if percentage < 0:
            percentage = 0 

        # --- G. RETURN THE CLEAN DATA ---
        return {
            "status": "success",
            "usn": usn,
            "name": name,
            "sgpa": sgpa,
            "percentage": round(percentage, 2), # <-- NEWLY ADDED
            "total_credits_attempted": total_credits_attempted,
            "total_grade_points_earned": total_grade_points_earned,
            "subjects": subjects
        }

    # --- NEW: SPECIFIC ERROR HANDLING ---
    except AttributeError as e:
        return {
            "status": "error",
            "message": f"A required pattern was not found (e.g., USN or Name). Error: {e}",
            "raw_text": full_text
        }
    except ValueError as e:
        return {
            "status": "error",
            "message": f"Failed to convert marks to a number. Error: {e}",
            "raw_text": full_text
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}",
            "raw_text": full_text
        }

# --- This runs our unit test ---
if __name__ == "__main__":
    test_grade_logic()