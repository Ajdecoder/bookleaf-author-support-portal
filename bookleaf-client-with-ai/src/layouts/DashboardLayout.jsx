import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";

const titles = {
  "/dashboard": { title: "Author Dashboard", subtitle: "Your books, royalties and support queries" },
  "/books": { title: "My Books", subtitle: "Published and in-production titles" },
  "/tickets": { title: "My Tickets", subtitle: "Track your support requests" },
  "/tickets/new": { title: "Submit Support Query", subtitle: "Raise a new request for the BookLeaf team" },
  "/admin/tickets": { title: "Ticket Queue", subtitle: "Manage incoming author support queries" },
};

export default function DashboardLayout() {
  const { pathname } = useLocation();

  const meta =
    titles[pathname] ||
    (pathname.startsWith("/admin")
      ? { title: "Ticket Details", subtitle: "Admin ticket management" }
      : { title: "Ticket Details", subtitle: "Support conversation" });

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={meta.title} subtitle={meta.subtitle} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}