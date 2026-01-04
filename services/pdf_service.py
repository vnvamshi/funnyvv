"""
PDF Service - Parse PDFs using Tika, pdfplumber, or Tesseract
"""

import os
import json
import psycopg2
from typing import Dict, Optional

def parse_pdf(filepath: str) -> Dict:
    """Parse PDF and extract text"""
    result = {
        'text': '',
        'pages': 0,
        'tables': [],
        'parser': None
    }
    
    # Try pdfplumber first (best for tables)
    try:
        import pdfplumber
        with pdfplumber.open(filepath) as pdf:
            result['pages'] = len(pdf.pages)
            for page in pdf.pages:
                result['text'] += page.extract_text() or ''
                tables = page.extract_tables()
                if tables:
                    result['tables'].extend(tables)
            result['parser'] = 'pdfplumber'
            print(f"[PDF] Parsed with pdfplumber: {result['pages']} pages")
            return result
    except Exception as e:
        print(f"[PDF] pdfplumber failed: {e}")
    
    # Try Apache Tika
    try:
        from tika import parser
        parsed = parser.from_file(filepath)
        result['text'] = parsed.get('content', '')
        result['parser'] = 'tika'
        print(f"[PDF] Parsed with Tika")
        return result
    except Exception as e:
        print(f"[PDF] Tika failed: {e}")
    
    # Fallback to Tesseract OCR
    try:
        import pytesseract
        from pdf2image import convert_from_path
        images = convert_from_path(filepath)
        result['pages'] = len(images)
        for img in images:
            result['text'] += pytesseract.image_to_string(img)
        result['parser'] = 'tesseract'
        print(f"[PDF] Parsed with Tesseract OCR: {result['pages']} pages")
        return result
    except Exception as e:
        print(f"[PDF] Tesseract failed: {e}")
    
    return result

def save_to_db(filepath: str, parsed: Dict):
    """Save parsed document to database"""
    conn = psycopg2.connect(database='vistaview')
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO document_knowledge 
        (source_file, source_type, content, parsed_by, created_at)
        VALUES (%s, 'pdf', %s, %s, NOW())
        RETURNING id
    """, (filepath, parsed['text'][:50000], parsed['parser']))
    
    doc_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"[PDF] Saved to document_knowledge: ID {doc_id}")
    return doc_id

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        parsed = parse_pdf(sys.argv[1])
        print(f"Extracted {len(parsed['text'])} characters")
