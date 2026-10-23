import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getTicketById,
  sendAdminResponse,
  updateTicket,
  addInternalNote,
  TICKET_STATUSES,
  CATEGORIES,
  PRIORITIES,
  generateAiDraft,
} from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function TicketDetails() {
  const { ticketId } = useParams();
  console.log(ticketId, 'ticketid here data')
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [response, setResponse] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";


  useEffect(() => {
    if (!ticketId) {
      setError("Ticket ID is missing");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await getTicketById(ticketId);
        console.log('data ka data',data);
        
        setTicket(data.ticket);
        console.log(ticket, 'ticket ka data here data')
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ticketId]);



  const handleSendResponse = async (event) => {
    event.preventDefault();

    if (!response.trim() || sending) return;

    setSending(true);
    setError("");

    try {
      const updated = await sendAdminResponse({
        ticketId: ticket._id,
        message: response.trim(),
      });

      setTicket(updated.ticket);
      setResponse("");
    } catch (err) {
      console.error("Send response error:", err);
      setError(err.message || "Failed to send response");
    } finally {
      setSending(false);
    }
  };


  const handleGenerateAiDraft = async () => {
    setGeneratingAi(true);
    setError("");
    try {
      const data = await generateAiDraft(ticket._id);
      setTicket(data.ticket);
    } catch (err) {
      setError(err.message || "AI analysis failed");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setError("");
      const updated = await updateTicket(ticket._id, { status });
      setTicket(updated.ticket || updated);
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  const handlePriorityChange = async (priority) => {
    try {
      setError("");
      const updated = await updateTicket(ticket._id, { priority });
      setTicket(updated.ticket || updated);
    } catch (err) {
      setError(err.message || "Failed to update priority");
    }
  };

  const handleCategoryChange = async (category) => {
    try {
      setError("");
      const updated = await updateTicket(ticket._id, { category });
      setTicket(updated.ticket || updated);
    } catch (err) {
      setError(err.message || "Failed to update category");
    }
  };

  const handleAssign = async () => {
    try {
      setError("");
      const updated = await updateTicket(ticket._id, {
        assignedTo: user.id,
      });
      setTicket(updated.ticket || updated);
    } catch (err) {
      setError(err.message || "Failed to assign ticket");
    }
  };

  const handleAddNote = async (event) => {
    event.preventDefault();

    if (!note.trim()) return;

    try {
      setError("");

      const updated = await addInternalNote({
        ticketId: ticket._id,
        message: note.trim(),
      });

      setTicket(updated);
      setNote("");
    } catch (err) {
      setError(err.message || "Failed to add internal note");
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading ticket...</p>;
  }

  if (error && !ticket) {
    return <p className="text-sm text-rose-600">{error}</p>;
  }

  if (!ticket) {
    return <p className="text-sm text-slate-500">Ticket not found.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {error && (
          <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </p>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{ticket.subject}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {ticket.id || ticket._id} • Created{" "}
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <StatusBadge label={ticket.priority} />
              <StatusBadge label={ticket.status} />
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {ticket.description}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-semibold">Conversation</h3>
          </div>

          <div className="space-y-4 p-6">
            {(ticket.messages || []).map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "admin"
                  ? "justify-end"
                  : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-xl rounded-2xl px-4 py-3 text-sm ${message.sender === user.role
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-800"
                    }`}
                >
                  <p className="mb-1 text-xs opacity-80">
                    {/* {message.sender === user.role ? user.name : message.senderName}
                     */}
                    {message.senderName}

                  </p>
                  <p className="whitespace-pre-wrap">{message.message}</p>
                  <p className="mt-2 text-[11px] opacity-70">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {ticket.messages.length < 0 && (
              <p className="text-sm text-slate-500">
                No replies yet.
              </p>
            )}
          </div>

          {isAdmin ? (
            <form
              onSubmit={handleSendResponse}
              className="border-t border-slate-200 p-6"
            >
              <label className="mb-2 block text-sm font-medium">
                Response to Author
              </label>

              <div className="mb-3 rounded-lg border border-violet-200 bg-violet-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-violet-950">AI ticket analysis</p>
                    <p className="mt-1 text-xs text-violet-800">
                      {ticket.aiStatus === "completed"
                        ? "AI suggestion ready. Review it before using."
                        : ticket.aiStatus === "pending"
                          ? "Analysis pending. You can generate it again below."
                          : ticket.aiStatus === "failed"
                            ? "Analysis failed or AI is not configured."
                            : "Generate a category, priority and suggested reply."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateAiDraft}
                    disabled={generatingAi}
                    className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-60"
                  >
                    {generatingAi ? "Analyzing..." : ticket.aiStatus === "completed" ? "Regenerate AI" : "Analyze with AI"}
                  </button>
                </div>
                {ticket.aiStatus === "completed" && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <p className="text-xs text-slate-700"><strong>Suggested category:</strong> {ticket.aiCategory}</p>
                    <p className="text-xs text-slate-700"><strong>Suggested priority:</strong> {ticket.aiPriority}</p>
                  </div>
                )}
                {ticket.aiDraftReply && (
                  <p className="mt-3 whitespace-pre-wrap rounded-md bg-white p-3 text-sm text-slate-700">{ticket.aiDraftReply}</p>
                )}
                <p className="mt-2 text-[11px] text-violet-800">AI never sends this reply automatically. An admin must review and send it.</p>
              </div>

              <textarea
                rows={5}
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder="Review or write a reply before sending."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!ticket.aiDraftReply}
                  onClick={() => setResponse(ticket.aiDraftReply)}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                >
                  Use AI Draft
                </button>

                <button
                  type="submit"
                  disabled={sending || !response.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send Response"}
                </button>
              </div>
            </form>
          ) : (<form
            onSubmit={handleSendResponse}
            className="border-t border-slate-200 p-6"
          >
            <label className="mb-2 block text-sm font-medium">
              Response to Admin
            </label>

            <textarea
              rows={5}
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              placeholder="Review or write a reply before sending."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <div className="mt-3 flex flex-wrap gap-3">

              <button
                type="submit"
                disabled={sending || !response.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send Response"}
              </button>
            </div>
          </form>)}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 font-semibold">Ticket Details</h3>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Category</dt>
              <dd>{ticket.category}</dd>
            </div>

            <div>
              <dt className="text-xs text-slate-500">Priority</dt>
              <dd><StatusBadge label={ticket.priority} /></dd>
            </div>

            <div>
              <dt className="text-xs text-slate-500">Status</dt>
              <dd><StatusBadge label={ticket.status} /></dd>
            </div>

            <div>
              <dt className="text-xs text-slate-500">Assigned To</dt>
              <dd>{ticket.assignedTo ? "Assigned" : "Unassigned"}</dd>
            </div>
          </dl>

          {isAdmin && (
            <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                <select
                  value={ticket.status}
                  onChange={(event) =>
                    handleStatusChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {TICKET_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Priority</label>
                <select
                  value={ticket.priority}
                  onChange={(event) =>
                    handlePriorityChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
                <select
                  value={ticket.category}
                  onChange={(event) =>
                    handleCategoryChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAssign}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Assign to me
              </button>
            </div>
          )}
        </section>

        {isAdmin && (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 font-semibold">Internal Notes</h3>

            <div className="space-y-3">
              {(ticket.internalNotes || []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-amber-50 p-3 text-sm"
                >
                  <p className="whitespace-pre-wrap">{item.message}</p>
                  <p className="mt-1 text-xs text-amber-700">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}

              {(ticket.internalNotes || []).length === 0 && (
                <p className="text-sm text-slate-500">
                  No internal notes yet.
                </p>
              )}
            </div>

            <form onSubmit={handleAddNote} className="mt-4 space-y-3">
              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add an internal note (not visible to author)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              <button
                type="submit"
                disabled={!note.trim()}
                className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                Add Note
              </button>
            </form>
          </section>
        )}
      </aside>
    </div>
  );
}
