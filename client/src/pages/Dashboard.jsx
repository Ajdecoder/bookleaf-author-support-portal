import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getAllBooks, getAllTickets, getBooksByAuthor, getTicketsByAuthor } from "../services/api.js";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      const [bookData, ticketData] = await Promise.all([
        getAllBooks(),
        getAllTickets(),
      ]);

      console.log('book ka data', bookData)
      console.log('ticket ka data', ticketData)

      if (active) {
        setBooks(bookData);
        setTickets(ticketData.tickets || []);
        setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  }

  const totalRoyalty = books.reduce((sum, book) => sum + book.totalRoyaltyEarned, 0);
  const pendingRoyalty = books.reduce((sum, book) => sum + book.royaltyPending, 0);
  const totalSales = books.reduce((sum, book) => sum + book.totalCopiesSold, 0);
  // const openTickets = tickets?.filter(
  //   (ticket) => ticket.status === "Open" || ticket.status === "In Progress"
  // ).length;
  const openTickets = () => { }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Books" value={books.length} />
        <StatCard title="Total Copies Sold" value={totalSales.toLocaleString()} accent="emerald" />
        <StatCard
          title="Total Royalty Earned"
          value={`₹${totalRoyalty.toLocaleString()}`}
          accent="indigo"
        />
        <StatCard
          title="Royalty Pending"
          value={`₹${pendingRoyalty.toLocaleString()}`}
          subtitle={`active support ticket(s)`}
          accent="amber"
        />
      </div>


      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent Books */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
            <h2 className="text-base font-semibold sm:text-lg">
              Recent Books
            </h2>
            <Link
              to="/books"
              className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {books.slice(0, 3).map((book) => (
              <div
                key={book.id}
                className="flex min-w-0 items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {book.title}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {book.isbn}
                  </p>
                </div>

                <div className="shrink-0">
                  <StatusBadge label={book.status} />
                </div>
              </div>
            ))}

            {books.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-500 sm:px-5">
                No books found.
              </p>
            )}
          </div>
        </section>

        {/* Recent Tickets */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
            <h2 className="text-base font-semibold sm:text-lg">
              Recent Tickets
            </h2>
            <Link
              to="/tickets"
              className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {tickets.slice(-3).reverse().map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket._id}`}
                className="block min-w-0 px-4 py-3 hover:bg-slate-50 sm:px-5 sm:py-4"
              >
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
                    {ticket.subject}
                  </p>
                  <div className="shrink-0">
                    <StatusBadge label={ticket.status} />
                  </div>
                </div>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {ticket.category} •{" "}
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}

            {tickets.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-500 sm:px-5">
                No support tickets yet.
              </p>
            )}
          </div>
        </section>
      </div>

    </div>
  );
}