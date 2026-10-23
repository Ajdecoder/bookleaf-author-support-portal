
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllTickets,
  CATEGORIES,
  TICKET_STATUSES,
  PRIORITIES,
} from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import {
  Search,
  RefreshCw,
  Ticket,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
} from "lucide-react";

const PAGE_SIZE = 10;

const INITIAL_FILTERS = {
  status: "All",
  category: "All",
  priority: "All",
  date: "All",
  search: "",
};

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const loadTickets = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getAllTickets();
      setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
    } catch (err) {
      setError(
        err?.message || "Unable to load tickets. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const stats = useMemo(() => {
    const unresolved = tickets.filter(
      (ticket) => !["Resolved", "Closed"].includes(ticket.status)
    );

    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "Open").length,
      urgent: unresolved.filter((ticket) =>
        ["Critical", "High"].includes(ticket.priority)
      ).length,
      resolved: tickets.filter(
        (ticket) => ticket.status === "Resolved"
      ).length,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const now = new Date();

    const result = tickets.filter((ticket) => {
      const statusMatch =
        filters.status === "All" || ticket.status === filters.status;

      const categoryMatch =
        filters.category === "All" ||
        ticket.category === filters.category;

      const priorityMatch =
        filters.priority === "All" ||
        ticket.priority === filters.priority;

      const subject = ticket.subject || "";
      const description = ticket.description || "";
      const ticketId = ticket.id || ticket._id || "";
      const author = ticket.author?.name || ticket.authorName || "";
      const email = ticket.author?.email || ticket.authorEmail || "";

      const searchMatch =
        !query ||
        [subject, description, ticketId, author, email].some((value) =>
          String(value).toLowerCase().includes(query)
        );

      const createdAt = new Date(ticket.createdAt);
      const validDate = !Number.isNaN(createdAt.getTime());

      let dateMatch = true;

      if (filters.date !== "All") {
        if (!validDate) {
          dateMatch = false;
        } else {
          const age = now.getTime() - createdAt.getTime();
          const day = 24 * 60 * 60 * 1000;

          if (filters.date === "Today") {
            dateMatch = createdAt.toDateString() === now.toDateString();
          } else if (filters.date === "7 days") {
            dateMatch = age >= 0 && age <= 7 * day;
          } else if (filters.date === "30 days") {
            dateMatch = age >= 0 && age <= 30 * day;
          }
        }
      }

      return (
        statusMatch &&
        categoryMatch &&
        priorityMatch &&
        searchMatch &&
        dateMatch
      );
    });

    const priorityRank = {
      Critical: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    };

    return result.sort((a, b) => {
      if (sortBy === "priority") {
        const priorityDifference =
          (priorityRank[b.priority] || 0) -
          (priorityRank[a.priority] || 0);

        if (priorityDifference !== 0) return priorityDifference;
      }

      if (sortBy === "oldest" || sortBy === "priority") {
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        );
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });
  }, [tickets, filters, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [filters, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTickets.length / PAGE_SIZE)
  );

  const paginatedTickets = filteredTickets.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const clearFilters = () => setFilters(INITIAL_FILTERS);

  const hasFilters =
    filters.status !== "All" ||
    filters.category !== "All" ||
    filters.priority !== "All" ||
    filters.date !== "All" ||
    filters.search !== "";

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
        <RefreshCw size={18} className="animate-spin" />
        Loading ticket queue...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ticket Queue
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor, prioritize and manage author support requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadTickets(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => loadTickets(true)}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tickets"
          value={stats.total}
          icon={Ticket}
          color="blue"
        />
        <StatCard
          title="Open Tickets"
          value={stats.open}
          icon={Clock3}
          color="amber"
        />
        <StatCard
          title="Urgent Unresolved"
          value={stats.urgent}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Resolved Tickets"
          value={stats.resolved}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-900">
              Filter tickets
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Find tickets by keyword, status, category, priority or date.
            </p>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              <X size={15} />
              Clear filters
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="Search subject, author, email, ID..."
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  search: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <FilterSelect
            value={filters.status}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            options={TICKET_STATUSES}
            placeholder="All Statuses"
          />

          <FilterSelect
            value={filters.category}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, category: value }))
            }
            options={CATEGORIES}
            placeholder="All Categories"
          />

          <FilterSelect
            value={filters.priority}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, priority: value }))
            }
            options={PRIORITIES}
            placeholder="All Priorities"
          />

          <div className="relative">
            <CalendarDays
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={filters.date}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  date: event.target.value,
                }))
              }
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">Any Date</option>
              <option value="Today">Today</option>
              <option value="7 days">Last 7 days</option>
              <option value="30 days">Last 30 days</option>
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="priority">Priority: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Ticket table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Support Tickets
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredTickets.length} matching ticket
              {filteredTickets.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Ticket</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Priority</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedTickets.map((ticket) => {
                const urgent =
                  ["Critical", "High"].includes(ticket.priority) &&
                  !["Resolved", "Closed"].includes(ticket.status);

                const createdAt = new Date(ticket.createdAt);
                const validDate = !Number.isNaN(createdAt.getTime());

                return (
                  <tr
                    key={ticket._id || ticket.id}
                    className={`transition hover:bg-slate-50 ${
                      urgent ? "bg-red-50/30" : ""
                    }`}
                  >
                    <td className="max-w-sm px-5 py-4">
                      <div className="flex items-start gap-2">
                        {urgent && (
                          <AlertTriangle
                            size={16}
                            className="mt-0.5 shrink-0 text-red-500"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {ticket.subject || "Untitled ticket"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            ID: {ticket.id || ticket._id}
                          </p>
                          {(ticket.author?.name ||
                            ticket.authorName ||
                            ticket.authorEmail) && (
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {ticket.author?.name ||
                                ticket.authorName ||
                                ticket.authorEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="max-w-52 px-5 py-4 text-xs text-slate-600">
                      {ticket.category || "Unclassified"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge label={ticket.priority || "Medium"} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge label={ticket.status || "Open"} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                      {validDate ? createdAt.toLocaleString() : "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/admin/tickets/${ticket._id}`}
                        className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="px-5 py-14 text-center">
            <Ticket
              size={30}
              className="mx-auto mb-3 text-slate-300"
            />
            <p className="font-medium text-slate-800">
              No tickets found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your filters or search terms.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredTickets.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filteredTickets.length)} of{" "}
              {filteredTickets.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <span className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    >
      <option value="All">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
