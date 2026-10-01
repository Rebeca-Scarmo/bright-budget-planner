import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell, Panel } from "@/components/AppShell";
import { brl, fmtPeriodo, realizado, useFinance } from "@/lib/finance-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ISGV" },
      { name: "description", content: "Indicadores de receitas, despesas e resultado previsto x realizado." },
      { property: "og:title", content: "Dashboard — ISGV" },
      { property: "og:description", content: "Indicadores de receitas, despesas e resultado previsto x realizado." },
    ],
  }),
  component: Dashboard,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Dashboard() {
  const { lancamentos, planejamentos, categorias } = useFinance();
  const data = useMemo(() => {
    const prevE = planejamentos.reduce((a, p) => a + p.entradaPrev, 0);
    const prevS = planejamentos.reduce((a, p) => a + p.saidaPrev, 0);
    const periodos = [...new Set(planejamentos.map((p) => p.periodo))];
    let realE = 0, realS = 0;
    periodos.forEach((per) => { const r = realizado(lancamentos, null, per); realE += r.e; realS += r.s; });
    const meses = [...new Set(lancamentos.map((l) => l.data.slice(0, 7)))].sort().slice(-6);
    const bars = meses.map((m) => {
      const r = realizado(lancamentos, null, m);
      const prev = planejamentos.filter((p) => p.periodo === m);
      return {
        mes: fmtPeriodo(m),
        Previsto: prev.length ? prev.reduce((a, p) => a + p.entradaPrev - p.saidaPrev, 0) : null,
        Realizado: r.e - r.s,
      };
    });
    const byCat = categorias.filter((c) => c.tipo === "saida").map((c) => ({
      name: c.nome, value: lancamentos.filter((l) => l.categoriaId === c.id).reduce((a, l) => a + l.valor, 0),
    })).filter((x) => x.value > 0);
    return { prevE, prevS, realE, realS, bars, byCat, periodos };
  }, [lancamentos, planejamentos, categorias]);

  const cards = [
    { label: "Receitas", prev: data.prevE, real: data.realE, good: data.realE >= data.prevE },
    { label: "Despesas", prev: data.prevS, real: data.realS, good: data.realS <= data.prevS },
    { label: "Resultado", prev: data.prevE - data.prevS, real: data.realE - data.realS, good: data.realE - data.realS >= data.prevE - data.prevS },
  ];

  return (
    <AppShell title="Dashboard" subtitle={`Períodos planejados: ${data.periodos.sort().map(fmtPeriodo).join(", ")}`}>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => {
          const pct = c.prev ? (c.real / c.prev) * 100 : 0;
          return (
            <Panel key={c.label} className="p-5">
              <div className="text-sm font-medium text-muted-foreground">{c.label}</div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">{brl(c.real)}</div>
              <div className="mt-1 text-xs text-muted-foreground">Realizado · previsto {brl(c.prev)}</div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${c.good ? "bg-success" : "bg-destructive"}`} style={{ width: `${Math.min(100, Math.abs(pct))}%` }} />
              </div>
              <div className={`mt-2 text-xs font-medium ${c.good ? "text-success" : "text-destructive"}`}>{pct.toFixed(1)}% do previsto</div>
            </Panel>
          );
        })}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold">Resultado previsto x realizado por mês</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={data.bars} barGap={4}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: number) => brl(v)} cursor={{ fill: "var(--muted)" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Previsto" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realizado" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="p-5">
          <h2 className="text-sm font-semibold">Despesas por categoria</h2>
          <div className="mt-4 h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.byCat} dataKey="value" innerRadius={52} outerRadius={80} paddingAngle={2} stroke="none">
                  {data.byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => brl(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {data.byCat.map((c, i) => (
              <li key={c.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1 text-muted-foreground">{c.name}</span>
                <span className="font-medium">{brl(c.value)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
