# Roadmap — enterprise-ready features

These items are **not** part of the hackathon MVP but describe how Policy Compass can evolve for real organisations.

## Authentication and workspaces **(future)**

- **Single sign-on (SSO)** via OpenID Connect / SAML for employee access.
- **Workspaces** (organisations / teams) with isolated document libraries and quotas.
- **Role-based access** (e.g. viewer vs. editor vs. admin).

## Data layer

- **MVP:** SQLite file (`data/policy-compass.db`) for a single-node deployment and demos.
- **Production scale:** **PostgreSQL** (with `pgvector` or similar) for multi-tenant storage, backups, HA, and larger corpora—same application logic, different adapter.

## Retrieval and trust

- Optional reranking and cross-encoder validation for high-stakes answers.
- Audit log of queries (metadata only, no raw policy text where possible).

## Compliance

- Data processing agreements, EU region hosting options, and DPIA templates for customers.
