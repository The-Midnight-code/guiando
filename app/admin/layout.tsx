import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r">
          <div className="border-b px-6 py-5">
            <h1 className="text-xl font-bold">Guiando</h1>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>

          <nav className="p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/admin"
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/scheduled-tours"
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  Scheduled Tours
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/tours"
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  Tours
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/guides"
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  Guides
                </Link>
              </li>

              <li>
                <Link
                  href="/admin/travelers"
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  Travelers
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b px-6">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Administration
              </span>
            </div>

            <div className="text-sm text-gray-500">Admin</div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
