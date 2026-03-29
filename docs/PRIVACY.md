# Privacy & data handling (EU-oriented summary)

Policy Compass is a prototype for **citation-backed internal Q&A**. This document describes how data is processed in the default MVP configuration so teams can align with GDPR-style expectations (transparency, data minimisation, purpose limitation).

## Roles

- **Controller**: Your team or organisation deploying the app (you decide what documents to upload).
- **Processor**: If you host on a cloud provider, that provider may process data under your instructions.

## What we process

- **Uploaded policy text** (Markdown or pasted text) split into passages for search.
- **Questions** typed by the user, used only to score passages and return a citation.

We **do not** require user accounts, email addresses, or personal profiles for the MVP.

## Default retrieval (no third-party AI)

The baseline implementation uses **TF–IDF retrieval on the server**. Passages and questions are processed in application memory on your infrastructure. No document content is sent to an external inference API unless you explicitly add such an integration later.

## Storage

- **In-memory store** for the hackathon MVP: data persists for the lifetime of the Node process and can be cleared in the UI. A restart typically wipes the index.
- **Do not** use this prototype as a long-term archive for sensitive documents without hardening (encryption at rest, access control, retention policy).

## International transfers

If you enable vendors (for example hosted embedding APIs), choose **EU data regions** where offered and list subprocessors in your privacy notice.

## Your responsibilities

- Only upload documents you are allowed to process.
- Provide your own **privacy notice** and, where required, a **legal basis** (for example legitimate interest for internal operations documentation).
- For production use, add **access control**, **audit logging** (without raw policy text where possible), and **retention** rules.

## Contact

Use your organisation’s data protection contact for requests from data subjects. This repository does not operate a central data controller service.
