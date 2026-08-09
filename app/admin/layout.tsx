import AdminNavbar from "@/components/adminNavbar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminNavbar />

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
