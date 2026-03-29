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
          <strong className="text-[var(--foreground)]">Your documents stay on your deployment.</strong>{" "}
          Text you index is processed in the application memory of your server instance. It is not
          sent to a third-party model in the default configuration (retrieval uses on-server
          TF–IDF).
        </li>
        <li>
          <strong className="text-[var(--foreground)]">Ephemeral by default.</strong> In this MVP,
          stored passages live in process memory and can be cleared with &quot;Clear all&quot; or
          lost on restart—suitable for demos, not regulated archives.
        </li>
        <li>
          <strong className="text-[var(--foreground)]">Logs.</strong> Avoid logging raw policy text
          in production. Configure hosting logs according to your organisation&apos;s policy.
        </li>
        <li>
          <strong className="text-[var(--foreground)]">Subprocessors.</strong> If you later enable
          external APIs (for example embeddings), document them in your DPIA and privacy notice; use
          EU regions where available.
        </li>
      </ul>
    </div>
  );
}
