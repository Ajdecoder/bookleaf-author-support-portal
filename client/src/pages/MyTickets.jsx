import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getAllTickets, getTicketsByAuthor } from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const data = await getAllTickets();
      if (active) {
        setTickets(data.tickets);
        console.log('data in mytickets',data.tickets);
        
        setLoading(false);
      }
    };

    load();

    return () => {
      active = false; 
    };
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading tickets...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          to="/tickets/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Submit New Query
        </Link>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Link 
            key={ticket._id}
            to={`/tickets/${ticket._id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:bg-slate-50"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{ticket.subject}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {ticket._id} • {ticket.category}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge label={ticket.priority} />
                <StatusBadge label={ticket.status} />
              </div>
            </div>

            <p className="mt-3 line-clamp-2 text-sm text-slate-600">
              {ticket.description}
            </p>

            <p className="mt-3 text-xs text-slate-500">
              Created {new Date(ticket.createdAt).toLocaleString()} • Updated{" "}
              {new Date(ticket.updatedAt).toLocaleString()}
            </p>
          </Link>
        ))}

        {tickets.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-sm text-slate-500">You have not raised any tickets yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}