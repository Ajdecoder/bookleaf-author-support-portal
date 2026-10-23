import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllTickets, CATEGORIES, TICKET_STATUSES, PRIORITIES } from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "All",
    category: "All",
    priority: "All",
    search: "",
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      const data = await getAllTickets();
      console.log('data from getalltickerts', data)
      console.log('data from setTickets1', tickets)

      if (active) {
        setTickets(data.tickets);
        console.log('data from setTickets2', tickets)
        setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets?.filter((ticket) => {
      const statusMatch =
        filters.status === "All" || ticket.status === filters.status;
      const categoryMatch =
        filters.category === "All" || ticket.category === filters.category;
      const priorityMatch =
        filters.priority === "All" || ticket.priority === filters.priority;
      const searchMatch =
        ticket.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(filters.search.toLowerCase());

      return statusMatch && categoryMatch && priorityMatch && searchMatch;
    });
  }, [tickets, filters]);

  if (loading) return <p className="text-sm text-slate-500">Loading ticket queue...</p>;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input
          placeholder="Search subject or description"
          value={filters.search}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, search: event.target.value }))
          }
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <select
          value={filters.status}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, status: event.target.value }))
          }
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="All">All Statuses</option>
          {TICKET_STATUSES.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>

        <select
          value={filters.category}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, category: event.target.value }))
          }
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, priority: event.target.value }))
          }
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="All">All Priorities</option>
          {PRIORITIES.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Ticket</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="max-w-sm px-5 py-4">
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-xs text-slate-500">{ticket.id}</p>
                  </td>
                  <td className="px-5 py-4 text-xs">{ticket.category}</td>
                  <td className="px-5 py-4">
                    <StatusBadge label={ticket.priority} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge label={ticket.status} />
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/admin/tickets/${ticket._id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-slate-500">
            No tickets match the selected filters.
          </p>
        )}
      </div>
    </div>
  );
}