## SLIIT Support Assistant

Students currently need to go through multiple pages, links, and menus in the SLIIT support portal to find specific details. This project solves that by providing a single assistant interface where users can ask questions directly and get relevant answers based on support content.

## Project Structure

- `webapp/` - React + Vite frontend
- `ballerina-integration/` - Ballerina API service (`/api/chat`)
- `docs/` - Markdown knowledge source files
- `ingest.py` - Ingestion script to embed and upsert knowledge into Pinecone

## Prerequisites

- Node.js 20+
- pnpm
- Python 3.10+
- Ballerina 2201.13.1+
- OpenAI API key
- Pinecone API key and index endpoint

## Setup

### 1) Install frontend dependencies

```bash
cd webapp
pnpm install
```

### 2) Install Python dependencies for ingestion

```bash
pip install openai pinecone python-dotenv pyyaml PyMuPDF
```

### 3) Configure ingestion environment

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=sliit-support
```

### 4) Configure Ballerina service

Create `ballerina-integration/Config.toml`:

```toml
OPENAI_TOKEN="your_openai_api_key"
PINECONE_API_KEY="your_pinecone_api_key"
PINECONE_URL="your_pinecone_index_url"
bucketName="sliit-support"
```

## Run

### 1) Ingest knowledge into Pinecone

```bash
python ingest.py
```

### 2) Start Ballerina API

```bash
cd ballerina-integration
bal run
```

### 3) Start web app

```bash
cd webapp
pnpm dev
```

Open the app in your browser and start chatting.
