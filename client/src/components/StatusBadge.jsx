const styles = {
  Open: "bg-amber-100 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Closed: "bg-slate-200 text-slate-700 border-slate-300",

  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",

  "Published & Live": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Printing: "bg-blue-100 text-blue-700 border-blue-200",
  "Distribution Setup": "bg-purple-100 text-purple-700 border-purple-200",
};

export default function StatusBadge({ label }) {
  const style = styles[label] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}