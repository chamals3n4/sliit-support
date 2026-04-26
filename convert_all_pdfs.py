import os
import fitz

BASE_DIR = "/home/chamal/dev/sliit-support/docs"

def pdf_to_markdown(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""

        for page_num, page in enumerate(doc, start=1):
            text += f"\n# Page {page_num}\n\n"
            text += page.get_text("text")

        md_path = pdf_path.replace(".pdf", ".md")

        with open(md_path, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"Converted: {pdf_path}")

    except Exception as e:
        print(f"Failed: {pdf_path} -> {e}")

for root, dirs, files in os.walk(BASE_DIR):
    for file in files:
        if file.lower().endswith(".pdf"):
            full_path = os.path.join(root, file)
            pdf_to_markdown(full_path)

print("success")