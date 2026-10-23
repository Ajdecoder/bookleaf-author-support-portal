import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Ticket,
  Plus,
  ChevronLeft,
  ChevronRight,
  Leaf,
  LogOut,
  UserRound,
  PanelLeft,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const authorLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/books", label: "My Books", icon: BookOpen },
  { to: "/tickets", label: "My Tickets", icon: Ticket },
  { to: "/tickets/new", label: "Submit Query", icon: Plus },
];

const adminLinks = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/tickets",
    label: "Ticket Queue",
    icon: Ticket,
  },

];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user?.role === "admin" ? adminLinks : authorLinks;

  const sidebarWidth = collapsed ? "w-[76px]" : "w-64";

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm lg:hidden"
        aria-label="Open sidebar"
      >
        <PanelLeft size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-dvh flex-col
          border-r border-slate-200 bg-white
          transition-[width,transform] duration-300 ease-in-out
          lg:sticky lg:top-0 lg:z-20 lg:translate-x-0
          ${sidebarWidth}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-slate-100 ${
            collapsed ? "justify-center px-2" : "justify-between px-5"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              <Leaf size={21} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-tight text-slate-900">
                  BookLeaf
                </p>
                <p className="text-xs text-slate-500">Author Support</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </p>
          )}

          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-colors ${
                  collapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-indigo-600" />
                  )}

                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.3 : 1.8}
                    className="shrink-0"
                  />

                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse button - desktop */}
        <div className="hidden px-3 pb-3 lg:block">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 ${
              collapsed ? "justify-center px-0" : ""
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={19} />
            ) : (
              <>
                <ChevronLeft size={19} />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>

        {/* User profile */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          <div
            className={`flex items-center gap-3 rounded-xl bg-slate-50 p-3 ${
              collapsed ? "justify-center px-1" : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <UserRound size={19} />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.email || ""}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}