#!/usr/bin/env python3
"""
PDF Parser using installed Python tools
Uses: pdfplumber (primary), PyPDF2 (fallback), tika (fallback)
"""

import sys
import json

def parse_with_pdfplumber(pdf_path):
    import pdfplumber
    text = ""
    tables = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
            page_tables = page.extract_tables()
            if page_tables:
                tables.extend(page_tables)
    return {"text": text, "tables": tables, "method": "pdfplumber"}

def parse_with_pypdf2(pdf_path):
    from PyPDF2 import PdfReader
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return {"text": text, "tables": [], "method": "PyPDF2"}

def parse_with_tika(pdf_path):
    from tika import parser
    parsed = parser.from_file(pdf_path)
    return {"text": parsed.get("content", ""), "tables": [], "method": "tika"}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    # Try each method
    methods = [
        ("pdfplumber", parse_with_pdfplumber),
        ("PyPDF2", parse_with_pypdf2),
        ("tika", parse_with_tika)
    ]
    
    for name, func in methods:
        try:
            result = func(pdf_path)
            if result.get("text"):
                print(json.dumps(result))
                return
        except Exception as e:
            continue
    
    print(json.dumps({"error": "All PDF parsers failed", "text": ""}))

if __name__ == "__main__":
    main()
