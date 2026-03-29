import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-[var(--foreground)]">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/" className="underline underline-offset-2">
          ← Back to app
        </Link>
      </p>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Privacy &amp; data handling</h1>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
        Policy Compass is designed with EU expectations around data minimisation, transparency, and
        purpose limitation. This page summarises how the MVP handles information. For the full text,
        see <code className="rounded bg-[var(--accent-soft)] px-1">docs/PRIVACY.md</code> in the
        repository.
      </p>
      <ul className="mt-8 list-disc space-y-3 pl-5 text-sm leading-relaxed">
        <li>
          <strong className="text-[var(--foreground)]">No accounts.</strong> The prototype does not
          collect names, emails, or authentication data.
        </li>
        <li>
          <strong className="text-[var(--foreground)]">Local SQLite storage.</strong> Passages (and
          optional embedding vectors) are stored in a database file on your server. Clear the index
          from the UI or delete the file according to your policy.
        </li>
        <li>
          <strong className="text-[var(--foreground)]">TF–IDF on the server.</strong> Always available
          without sending text to a third party.
        </li>
        <li>
          <strong className="text-[var(--foreground)]">Optional Hugging Face embeddings.</strong> If
          you set <code className="rounded bg-[var(--accent-soft)] px-1">HF_TOKEN</code>, passages
          and questions may be sent to the Hugging Face Inference API for open-source sentence
          embeddings. List Hugging Face as a subprocessor where required.
        </li>
        <li>
          <strong className="text-[var(--foreground)]">Logs.</strong> Avoid logging raw policy text in
          production. Configure hosting logs according to your organisation&apos;s policy.
        </li>
      </ul>
    </div>
  );
}
