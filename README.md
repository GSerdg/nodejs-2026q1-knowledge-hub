# Knowledge Hub

## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.

## Downloading

```
git clone {repository URL}
```

## Installing NPM modules

```
npm install
```

## Environment

Copy the example environment file and adjust values if needed:

```
cp .env.example .env
```

The project expects PostgreSQL settings and JWT secrets in `.env`. For Docker Compose the `POSTGRES_HOST` should be set to `db`.

## Running in development

This starts the database in Docker and runs the API locally in NestJS watch mode.

```
docker compose up -d db
npm run start:dev
```

OpenAPI docs will be available at http://localhost:4000/doc/ after the app starts.

## Running in production

The production setup runs the full stack inside Docker.

```
docker compose up --build
```

This command builds the API image, starts the PostgreSQL database, and brings the service up on port `4000`.

After startup, open http://localhost:4000/doc/ to access the API documentation.

### Stop production services

```
docker compose down
```

## Docker

The API is also available as a Docker image on Docker Hub:

https://hub.docker.com/repository/docker/gserdg/knowledge-hub-api/general

You can run it locally using Docker or Docker Compose if you have the repository configured.

## Testing

After application running open new terminal and enter:

To run only one of all test suites

```
npm run test -- <path to suite>
```

To run all test with authorization

```
npm run test:auth
```

To run only specific test suite with authorization

```
npm run test:auth -- <path to suite>
```

To run refresh token tests

```
npm run test:refresh
```

To run RBAC (role-based access control) tests

```
npm run test:rbac
```

To run unit tests

```
npm run test:unit
```

To run all tests with authorization and unit tests

```
npm run test
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

### Debugging in VSCode

Press <kbd>F5</kbd> to debug.

For more information, visit: https://code.visualstudio.com/docs/editor/debugging

## AI Integration (Google Gemini)

The Knowledge Hub API is extended with AI-powered features for article summarization, translation, and analysis using the **gemini-2.5-flash-light** model.

### 1. How to obtain a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Log in with your Google account.
3. Click the **"Get API key"** button in the sidebar.
4. Click **"Create API key in new project"** or select an existing one.
5. Copy your API key.

### 2. Environment Setup

Add the following variables to your `.env` file:

```dotenv
# Your API key from Google AI Studio
GEMINI_API_KEY=your_actual_api_key_here

# API Configuration
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=gemini-2.5-flash-light

# Performance & Rate Limiting
AI_RATE_LIMIT_RPM=15
AI_CACHE_TTL_SEC=300
```

### 3. How to Run and Test AI Endpoints

1. Ensure your `.env` is configured with a valid API key.
2. Start the application: `npm run start:dev`.
3. Use Swagger UI at `http://localhost:4000/doc/` or use the following endpoints:

- **Summarize Article:** `POST /ai/articles/:articleId/summarize`
  - Body: `{"maxLength": "short" | "medium" | "detailed"}`
- **Translate Article:** `POST /ai/articles/:articleId/translate`
  - Body: `{"targetLanguage": "Spanish", "sourceLanguage": "English"}`
- **Analyze Content:** `POST /ai/articles/:articleId/analyze`
  - Body: `{"task": "review" | "bugs" | "optimize" | "explain"}`

### 4. Known Limitations

- **Regional Availability:** Google AI is currently restricted in certain regions (e.g., Russia and Belarus). To access Google AI Studio and use the API:
  - **VPN Required:** Use a reliable VPN service with a location where Google AI is available (e.g., USA, Germany, or UK).
  - **Incognito Mode:** It is highly recommended to open Google AI Studio in **Incognito/Private mode** in your browser to avoid issues with regional cookies or cached account data.
- **Free Tier Quotas:** The Google Gemini free tier has a limit of requests per minute (RPM). If you hit the limit (HTTP 429), wait for 60 seconds before retrying.
- **Latency:** AI generation typically takes between 2 to 10 seconds depending on the article length.
- **Regional Availability:** Google Gemini API may have restricted access in certain regions.
- **Data Privacy:** On the free tier, Google may use submitted data to improve its models. Do not submit sensitive or confidential information.

### 5. Testing via Proxy (Fiddler / Global Proxy)
The Docker configuration is pre-configured to route AI traffic through a proxy on your host machine to bypass regional restrictions or for debugging.

#### Fiddler Setup:
1. **Download:** Install [Fiddler Classic](https://telerik.com).
2. **Decrypt HTTPS:** Go to `Tools -> Options -> HTTPS` and check **"Decrypt HTTPS traffic"**.
3. **Allow Connections:** Go to `Tools -> Options -> Connections` and check **"Allow remote computers to connect"**.
4. **Ensure Port Match:** Ensure Fiddler is listening on port **8888** (as defined in `docker-compose.yaml`).

#### How it works:
The application in Docker uses `PROXY_HOST=host.docker.internal` and `PROXY_PORT=8888` by default. This allows the container to talk to Fiddler running on your Windows/Mac/Linux host.

#### Troubleshooting (SSL Issues):
If you encounter SSL/TLS certificate errors (common when Fiddler intercepts HTTPS), add the following to your `.env` for local testing:
```dotenv
NODE_TLS_REJECT_UNAUTHORIZED=0
```
**Warning:** This disables SSL validation. Use it **only** for local development and testing.

## Knowledge Hub RAG & Vector Database

This project uses a Retrieval-Augmented Generation (RAG) system. The AI answers questions based on articles in the local database.

### 1. Vector Database Setup (Qdrant)

The system uses Qdrant as an external vector database. Qdrant runs in a dedicated Docker container.

*   **URL**: `http://localhost:6333` (Local) / `http://vectordb:6333` (Docker)
*   **Dashboard**: http://localhost:6333/dashboard
*   **Models**: The system uses `gemini-embedding-2` to generate 3072-dimensional vectors.

### 2. Additional Environment Setup

Add these RAG-specific variables to your `.env` file:

```dotenv
# RAG Models & Keys
GEMINI_EMBEDDING_MODEL=gemini-embedding-2

# Vector DB Configuration
RAG_VECTOR_DB_URL=http://localhost:6333
RAG_VECTOR_COLLECTION=knowledge_hub_articles

# Chunking & Memory Settings
RAG_CHUNK_SIZE=800
RAG_CHUNK_OVERLAP=200
RAG_CONVERSATION_MAX_MESSAGES=20
```

### 3. RAG Core Flow & Endpoints

#### Step 1: Indexing Data

Before chatting, synchronize your articles with the vector database:

*   **Index Articles:** `POST /ai/rag/index`
    *   Body: `{"onlyPublished": true}` (default)
    *   This splits content into chunks, generates embeddings, and stores them in Qdrant.

#### Step 2: Semantic Search

Search for content by meaning rather than keywords:

*   **Search:** `POST /ai/rag/search`
    *   Body: `{"query": "Why is Bitcoin limited?", "limit": 5}`

#### Step 3: Chat with Knowledge Base

Ask questions based on your articles:

*   **Chat:** `POST /ai/rag/chat`
    *   Body: `{"question": "What are the environmental concerns?", "conversationId": "optional-uuid"}`
    *   Returns an answer with **Source Attribution** (links to relevant articles).

#### Step 4: Maintenance

*   **Delete from Index:** `DELETE /ai/rag/index/articles/:articleId`
    *   Removes all vector entries for a specific article.

### 4. Startup Flow after Clone

1.  **Environment**: Set `GEMINI_API_KEY` and `RAG_VECTOR_DB_URL`.
2.  **Launch Infrastructure**:

    ```bash
    docker compose up -d db vectordb
    ```
3.  **Start App**: `npm run start:dev`
4.  **Build Vector Index**: Send a `POST` request to `http://localhost:4000/ai/rag/index`.
5.  **Start Chatting**: Use the `/ai/rag/chat` endpoint.

### 5. RAG Specific Limitations & Notes

*   **Embedding Dimension**: The system is pre-configured for **3072** dimensions (Gemini 2). If you change the model, delete the Qdrant collection using `curl -X DELETE http://localhost:6333/collections/knowledge_hub_articles`.
*   **Task Prefixes**: The system automatically adds `task: retrieval_document` for indexing and `task: retrieval_query` for searching for `gemini-embedding-2`.
*   **Conversation Memory**: Chat history is stored in-memory (CacheManager). If the server restarts, conversation context is lost, but the vector index remains persistent in Docker volumes.
