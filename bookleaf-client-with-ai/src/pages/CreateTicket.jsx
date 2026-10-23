import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getBooksByAuthor, submitTicket } from "../services/api.js";

export default function CreateTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    authorId: user?.authorId || "",
    bookId: "",
    subject: "",
    description: "",
    category: "General Inquiry",
  });
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {

    const loadBooks = async () => {
      const books = await getBooksByAuthor();
      console.log(books)
      setBooks(books);
    };

    loadBooks();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        authorId: user.authorId,
        bookId: form.bookId,
        subject: form.subject,
        description: form.description,
        category: form.category,
      }
      await submitTicket(payload);

      // navigate(`/tickets/${ticket._id}`);
    } catch (err) {
      setError(err.message || "Unable to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-5 rounded-xl border border-slate-200 bg-white p-6"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">
          Related Book
        </label>
        <select
          name="bookId"
          value={form.bookId}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">General / Account Level</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Category
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option>Royalty & Payments</option>
          <option>ISBN & Metadata Issues</option>
          <option>Printing & Quality</option>
          <option>Distribution & Availability</option>
          <option>Book Status & Production Updates</option>
          <option>General Inquiry</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Subject
        </label>
        <input
          name="subject"
          required
          minLength={3}
          maxLength={180}
          value={form.subject}
          onChange={handleChange}
          placeholder="Briefly describe your issue"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Detailed Description
        </label>
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={10000}
          rows={6}
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your issue in detail."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Attachment <span className="text-slate-400">(optional)</span>
        </label>
        <input
          type="file"
          onChange={(event) =>
            setAttachment(event.target.files?.[0] || null)
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {attachment && (
          <p className="mt-1 text-xs text-slate-500">
            Selected: {attachment.name}
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Query"}
      </button>
    </form>
  );
}