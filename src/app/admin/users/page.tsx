import { db } from "@/lib/db"
import { makeAdminAction, removeAdminAction, deleteUserAction } from "./actions"

type Props = { searchParams: Promise<{ q?: string }> }

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q } = await searchParams

  const users = await db.user.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, name: true, email: true, username: true, role: true, createdAt: true,
      _count: { select: { reviews: true, watchEventsCreated: true } },
    },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Users</h1>

      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or email…"
          className="w-72 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
        />
        <button type="submit" className="ml-2 rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700">
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">User</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Role</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Activity</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {users.map((u) => {
              const boundMakeAdmin = makeAdminAction.bind(null, u.id)
              const boundRemoveAdmin = removeAdminAction.bind(null, u.id)
              const boundDelete = deleteUserAction.bind(null, u.id)
              return (
                <tr key={u.id} className="bg-white dark:bg-neutral-900">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900 dark:text-white">{u.name ?? "(no name)"}</p>
                    <p className="text-xs text-neutral-500">{u.email}</p>
                    {u.username && <p className="text-xs text-neutral-400">@{u.username}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {u._count.reviews} reviews · {u._count.watchEventsCreated} events
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {u.role === "ADMIN" ? (
                        <form action={boundRemoveAdmin}>
                          <button type="submit" className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                            Remove Admin
                          </button>
                        </form>
                      ) : (
                        <form action={boundMakeAdmin}>
                          <button type="submit" className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                            Make Admin
                          </button>
                        </form>
                      )}
                      <form action={boundDelete}>
                        <button type="submit" className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
                          onClick={(e) => { if (!confirm("Delete this user and all their data?")) e.preventDefault() }}>
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="px-4 py-6 text-sm text-neutral-500">No users found.</p>
        )}
      </div>
    </div>
  )
}
