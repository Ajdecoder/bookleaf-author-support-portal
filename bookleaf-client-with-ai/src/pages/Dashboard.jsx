import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getAllBooks, getAllTickets, getBooksByAuthor, getTicketsByAuthor } from "../services/api.js";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [ books, setBooks] = useState([]);
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
  const openTickets = () =>{}

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

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold">Recent Books</h2>
            <Link to="/books" className="text-sm font-medium text-indigo-600">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {books.slice(0, 3).map((book) => (
              <div key={book.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium">{book.title}</p>
                  <p className="text-xs text-slate-500">{book.isbn}</p>
                </div>
                <StatusBadge label={book.status} />
              </div>
            ))}

            {books.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">
                No books found.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold">Recent Tickets</h2>
            <Link to="/tickets" className="text-sm font-medium text-indigo-600">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {tickets.slice(-3).reverse().map((ticket) => (
              <Link 
                key={ticket.id}
                to={`/tickets/${ticket._id}`}
                className="block px-5 py-4 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{ticket.subject}</p>
                  <StatusBadge label={ticket.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}

            {tickets.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">
                No support tickets yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}