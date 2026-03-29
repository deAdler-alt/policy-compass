# Privacy & data handling (EU-oriented summary)

Policy Compass is a prototype for **citation-backed internal Q&A**. This document describes how data is processed in the MVP so teams can align with GDPR-style expectations (transparency, data minimisation, purpose limitation).

## Roles

- **Controller**: Your team or organisation deploying the app (you decide what documents to upload).
- **Processor**: If you host on a cloud provider, that provider may process data under your instructions.

## What we process

- **Uploaded policy text** (Markdown or pasted text) split into passages for search.
- **Questions** typed by the user, used only to retrieve passages and return a citation.

We **do not** require user accounts, email addresses, or personal profiles for the MVP.

## Retrieval modes

1. **TF–IDF (always available)**  
   Runs on your server. No document text is sent to a third party.

2. **Embeddings (optional)**  
   If you set `HF_TOKEN`, passages and questions can be embedded using the open-source model configured via `HF_EMBEDDINGS_MODEL` (default: `sentence-transformers/all-MiniLM-L6-v2`) through the **Hugging Face Inference API**.  
   Your organisation acts as the controller for that transfer; list Hugging Face as a **subprocessor** in your privacy notice if you enable this. Prefer EU-focused hosting and tokens with minimal scope.

## Storage (MVP)

- **SQLite** database file (default: `data/policy-compass.db`) stores passages and optional embedding vectors.  
- For **production** deployments, teams typically move to **PostgreSQL** (see [ROADMAP.md](./ROADMAP.md)) with backups, encryption at rest, and access control.

## International transfers

If you enable Hugging Face or other vendors, choose **EU data regions** where offered and document subprocessors clearly.

## Your responsibilities

- Only upload documents you are allowed to process.
- Provide your own **privacy notice** and, where required, a **legal basis** (for example legitimate interest for internal operations documentation).
- For production use, add **access control**, **audit logging** (without raw policy text where possible), and **retention** rules.

## Contact

Use your organisation’s data protection contact for requests from data subjects. This repository does not operate a central data controller service.
