# Policy Compass

**Enterprise theme · Octoverse Hackathon**

Policy Compass answers questions about internal policies using **only verbatim passages** from documents you upload. If nothing in the corpus supports an answer, the app says so—no invented compliance advice.

## Features

- Index Markdown or pasted text (chunked into retrievable passages).
- **Load sample policy** for instant demo.
- **TF–IDF retrieval** on the server by default—no third-party inference required.
- **Citation-first** responses: short answer + quoted source passage + document name.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Load sample policy**, then ask: *When is the submission deadline?*

## Scripts

| Command      | Description                |
| ------------ | -------------------------- |
| `npm run dev`    | Development server         |
| `npm run build`  | Production build           |
| `npm run start`  | Run production server      |
| `npm run lint`   | ESLint (zero warnings)     |

## Tech stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- Retrieval: **TF–IDF + cosine similarity** (`src/lib/tfidf.ts`)

## API (same origin)

| Method | Path             | Description                                      |
| ------ | ---------------- | ------------------------------------------------ |
| `GET`  | `/api/documents` | List indexed documents                           |
| `POST` | `/api/documents` | Body: `{ "name": string, "content": string }`   |
| `DELETE` | `/api/documents` | Clear all indexed documents                    |
| `POST` | `/api/ask`       | Body: `{ "question": string }`                 |
| `GET`  | `/api/seed`      | Sample Markdown for “Load sample policy”       |

## Privacy (EU)

- In-app summary: [`/privacy`](http://localhost:3000/privacy)
- Repository: [docs/PRIVACY.md](./docs/PRIVACY.md)

## Acknowledgements

- Built with [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/).

## Licence

See [LICENSE](./LICENSE).
