import os
import re
import yaml
from pathlib import Path
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "sliit-support")
DOCS_DIR = Path("docs")

def init_pinecone():
    existing = [i.name for i in pc.list_indexes()]
    if INDEX_NAME not in existing:
        pc.create_index(
            name=INDEX_NAME,
            dimension=1536,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
        print(f"Created index: {INDEX_NAME}")
    return pc.Index(INDEX_NAME)

def parse_markdown(filepath: Path):
    content = filepath.read_text(encoding="utf-8")
    
    # Extract YAML frontmatter
    frontmatter = {}
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            frontmatter = yaml.safe_load(parts[1])
            content = parts[2].strip()
    
    # Split by ## headings
    sections = re.split(r'\n(?=## )', content)
    chunks = []
    
    for section in sections:
        section = section.strip()
        if not section or len(section) < 50:  # skip tiny sections
            continue
        
        # Extract heading
        lines = section.split("\n", 1)
        heading = lines[0].replace("##", "").strip()
        body = lines[1].strip() if len(lines) > 1 else ""
        
        chunks.append({
            "heading": heading,
            "text": section,
            "source": filepath.name,
            "category": frontmatter.get("category", "general"),
            "title": frontmatter.get("title", filepath.stem),
        })
    
    return chunks

def embed(text: str):
    response = openai_client.embeddings.create(
        input=text,
        model="text-embedding-ada-002",
    )
    return response.data[0].embedding

def ingest_all(index):
    md_files = list(DOCS_DIR.glob("*.md"))
    print(f"Found {len(md_files)} markdown files")
    
    total = 0
    for filepath in md_files:
        chunks = parse_markdown(filepath)
        print(f"  {filepath.name}: {len(chunks)} chunks")
        
        vectors = []
        for i, chunk in enumerate(chunks):
            vector = embed(chunk["text"])
            vectors.append({
                "id": f"{filepath.stem}-{i}",
                "values": vector,
                "metadata": {
                    "text": chunk["text"],
                    "heading": chunk["heading"],
                    "source": chunk["source"],
                    "category": chunk["category"],
                    "title": chunk["title"],
                }
            })
        
        # Upsert in batches of 100
        for j in range(0, len(vectors), 100):
            index.upsert(vectors=vectors[j:j+100])
        
        total += len(chunks)
    
    print(f"\nDone! Total chunks ingested: {total}")

if __name__ == "__main__":
    index = init_pinecone()
    ingest_all(index)