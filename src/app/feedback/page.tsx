import { submitFeedbackAction } from "./actions"

type Props = { searchParams: Promise<{ error?: string; success?: string }> }

export default async function FeedbackPage({ searchParams }: Props) {
  const { error, success } = await searchParams

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">Send Feedback</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Report a bug, request a feature, or share general feedback. We read everything.
      </p>

      {success === "1" && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
          Thanks for your feedback! We&apos;ll take a look.
        </div>
      )}
      {error === "missing-fields" && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Please fill in all fields.
        </div>
      )}
      {error === "rate-limit" && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
          You&apos;ve submitted too many reports today. Please try again tomorrow.
        </div>
      )}

      {success !== "1" && (
        <form action={submitFeedbackAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Type</label>
            <select name="type" required className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white">
              <option value="BUG_REPORT">Bug Report</option>
              <option value="FEATURE_REQUEST">Feature Request</option>
              <option value="GENERAL">General Feedback</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Title</label>
            <input
              name="title"
              required
              maxLength={120}
              placeholder="Brief summary"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Details</label>
            <textarea
              name="body"
              required
              rows={5}
              placeholder="Describe the issue or idea in detail…"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  )
}
