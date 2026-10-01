import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, LogOut } from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/lancamentos", label: "Lançamentos" },
  { to: "/planejamento", label: "Planejamento" },
  { to: "/dre", label: "DRE" },
  { to: "/categorias", label: "Categorias" },
] as const;

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">IS</span>
      ISGV
    </span>
  );
}

export function AppShell({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const linkCls = "rounded-md px-3 py-1.5 text-sm font-medium text-navy-muted transition-colors hover:text-navy-foreground hover:bg-navy-accent";
  const activeCls = "!text-navy-foreground bg-navy-accent";
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-navy text-navy-foreground">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link to="/dashboard"><Logo /></Link>
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className={linkCls} activeProps={{ className: activeCls }}>{n.label}</Link>
            ))}
          </nav>
          <Link to="/" className="ml-auto hidden items-center gap-2 text-sm text-navy-muted hover:text-navy-foreground md:flex">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-navy-accent text-xs">RS</span>
            <LogOut className="h-4 w-4" />
          </Link>
          <button className="ml-auto md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-navy-accent px-4 py-3 md:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className={linkCls} activeProps={{ className: activeCls }}>{n.label}</Link>
            ))}
            <Link to="/" className={linkCls}>Sair</Link>
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border bg-card shadow-card ${className}`}>{children}</div>;
}

export function NativeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-9 w-full rounded-md border border-input bg-card px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
