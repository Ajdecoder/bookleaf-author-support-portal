import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getAllBooks, getBooksByAuthor } from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function MyBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooksByAuthor().then((data) => {
      setBooks(data);
      setLoading(false);
    });
  }, [user.authorId]);

  if (loading) return <p className="text-sm text-slate-500">Loading books...</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Book</th>
              <th className="px-5 py-3">ISBN</th>
              <th className="px-5 py-3">Genre</th>
              <th className="px-5 py-3">Publication Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">MRP</th>
              <th className="px-5 py-3">Copies Sold</th>
              <th className="px-5 py-3">Royalty Earned</th>
              <th className="px-5 py-3">Paid</th>
              <th className="px-5 py-3">Pending</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-medium">{book.title}</td>

                <td className="px-5 py-4 font-mono text-xs">
                  {book.isbn}
                </td>

                <td className="px-5 py-4">{book.genre || "—"}</td>

                <td className="px-5 py-4">
                  {book.publicationDate
                    ? new Date(book.publicationDate).toLocaleDateString("en-IN")
                    : "—"}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge label={book.status} />
                </td>

                <td className="px-5 py-4">
                  ₹{(book.mrp ?? 0).toLocaleString("en-IN")}
                </td>

                <td className="px-5 py-4">
                  {(book.totalCopiesSold ?? 0).toLocaleString("en-IN")}
                </td>

                <td className="px-5 py-4">
                  ₹{(book.totalRoyaltyEarned ?? 0).toLocaleString("en-IN")}
                </td>

                <td className="px-5 py-4">
                  ₹{(book.royaltyPaid ?? 0).toLocaleString("en-IN")}
                </td>

                <td className="px-5 py-4 font-medium">
                  ₹{(book.royaltyPending ?? 0).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {books.length === 0 && (
        <p className="px-5 py-12 text-center text-sm text-slate-500">
          No books available yet.
        </p>
      )}
    </div>
  );
}