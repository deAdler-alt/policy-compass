# Policy Compass

**Enterprise theme · Octoverse Hackathon**

Policy Compass answers questions about internal policies using **only verbatim passages** from documents you upload. If nothing in the corpus supports an answer, the app says so—no invented compliance advice.

## Features

- **Citation-first RAG:** short answer + quoted passage + document name.
- **Retrieval:** optional **Hugging Face Inference API** embeddings (open-source `sentence-transformers/all-MiniLM-L6-v2` by default) with **TF–IDF fallback** when no token is set or when embedding calls fail.
- **Persistence:** **SQLite** (`data/policy-compass.db` by default). For production, teams typically scale to **PostgreSQL** (see [docs/ROADMAP.md](./docs/ROADMAP.md)).
- Sample policies: [content/samples/](./content/samples/) (Markdown files to paste or upload for testing).

## Quick start

```bash
cp .env.example .env
# Optional: add HF_TOKEN from https://huggingface.co/settings/tokens for embedding retrieval
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Load sample policy**, then ask: *When is the submission deadline?*

### Environment variables

| Variable | Description |
| --- | --- |
| `HF_TOKEN` | Hugging Face API token (Inference API). Enables embedding retrieval. |
| `HF_EMBEDDINGS_MODEL` | Optional. Default: `sentence-transformers/all-MiniLM-L6-v2`. |
| `DATABASE_PATH` | Optional. Path to SQLite file (default: `data/policy-compass.db`). |
| `DISABLE_EMBEDDINGS` | Set to `1` or `true` to force TF–IDF only. |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint (`src` only, zero warnings) |

## Tech stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- **better-sqlite3** — local SQLite
- Retrieval: **TF–IDF** (`src/lib/tfidf.ts`) + optional **HF embeddings** (`src/lib/embeddings/hf.ts`)

## API (same origin)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/documents` | List indexed documents |
| `POST` | `/api/documents` | Body: `{ "name": string, "content": string }` |
| `DELETE` | `/api/documents` | Clear all indexed documents |
| `POST` | `/api/ask` | Body: `{ "question": string }` — response includes `retrieval`: `embedding` or `tfidf` when successful |
| `GET` | `/api/seed` | Sample Markdown for “Load sample policy” |
| `GET` | `/api/meta` | Non-secret retrieval / DB hints for the UI |

## Devpost / production notes

- **MVP storage:** SQLite file on the application host.
- **Enterprise scale:** describe migration to **PostgreSQL** (+ optional `pgvector`) for HA, backups, and multi-tenant workloads.

## Privacy (EU)

- In-app summary: [`/privacy`](http://localhost:3000/privacy)
- Details: [docs/PRIVACY.md](./docs/PRIVACY.md)

## Future features (not in MVP)

See [docs/ROADMAP.md](./docs/ROADMAP.md) — SSO, workspaces, Postgres, audit logs.

## Acknowledgements

- [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- Embeddings via [Hugging Face Inference API](https://huggingface.co/docs/api-inference) (optional) and open-source [sentence-transformers](https://www.sbert.net/) models.

## Licence

See [LICENSE](./LICENSE).
