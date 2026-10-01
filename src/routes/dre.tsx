import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { AppShell, Panel } from "@/components/AppShell";
import { brl, useFinance, type Tipo } from "@/lib/finance-store";

export const Route = createFileRoute("/dre")({
  head: () => ({
    meta: [
      { title: "DRE — ISGV" },
      { name: "description", content: "Demonstrativo de resultado gerencial: previsto, realizado e diferença." },
      { property: "og:title", content: "DRE — ISGV" },
      { property: "og:description", content: "Demonstrativo de resultado gerencial: previsto, realizado e diferença." },
    ],
  }),
  component: DRE,
});

type Line = { prev: number; real: number };

function DRE() {
  const { categorias, lancamentos, planejamentos } = useFinance();
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const periodos = new Set(planejamentos.map((p) => p.periodo));

  const build = (tipo: Tipo) => categorias.filter((c) => c.tipo === tipo).map((c) => {
    const subs = c.subs.map((s) => {
      const prev = planejamentos.filter((p) => p.categoriaId === c.id && p.sub === s).reduce((a, p) => a + (tipo === "entrada" ? p.entradaPrev : p.saidaPrev), 0);
      const real = lancamentos.filter((l) => l.categoriaId === c.id && l.sub === s && periodos.has(l.data.slice(0, 7))).reduce((a, l) => a + l.valor, 0);
      return { nome: s, prev, real };
    });
    const sum = (k: keyof Line) => subs.reduce((a, s) => a + s[k], 0);
    return { id: c.id, nome: c.nome, subs, prev: sum("prev"), real: sum("real") };
  });
  const rec = build("entrada"), desp = build("saida");
  const tot = (x: Line[]) => ({ prev: x.reduce((a, s) => a + s.prev, 0), real: x.reduce((a, s) => a + s.real, 0) });
  const tr = tot(rec), td = tot(desp);

  const Nums = ({ l, tipo, strong }: { l: Line; tipo: Tipo; strong?: boolean }) => {
    const diff = l.real - l.prev;
    const good = tipo === "entrada" ? diff >= 0 : diff <= 0;
    return (
      <>
        <td className={`px-4 py-2.5 text-right ${strong ? "font-semibold" : ""}`}>{brl(l.prev)}</td>
        <td className={`px-4 py-2.5 text-right ${strong ? "font-semibold" : ""}`}>{brl(l.real)}</td>
        <td className={`px-4 py-2.5 text-right font-medium ${diff === 0 ? "text-muted-foreground" : good ? "text-success" : "text-destructive"}`}>{diff > 0 ? "+" : ""}{brl(diff)}</td>
      </>
    );
  };

  const Section = ({ title, data, total, tipo }: { title: string; data: typeof rec; total: Line; tipo: Tipo }) => (
    <tbody>
      <tr className="bg-secondary">
        <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">{title}</td>
        <Nums l={total} tipo={tipo} strong />
      </tr>
      {data.map((c) => (
        <>
          <tr key={c.id} className="cursor-pointer border-t hover:bg-muted/40" onClick={() => setClosed({ ...closed, [c.id]: !closed[c.id] })}>
            <td className="px-4 py-2.5 font-medium">
              <span className="flex items-center gap-1.5"><ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${closed[c.id] ? "" : "rotate-90"}`} />{c.nome}</span>
            </td>
            <Nums l={c} tipo={tipo} strong />
          </tr>
          {!closed[c.id] && c.subs.map((s) => (
            <tr key={c.id + s.nome} className="text-muted-foreground">
              <td className="py-2 pl-11 pr-4">{s.nome}</td>
              <Nums l={s} tipo={tipo} />
            </tr>
          ))}
        </>
      ))}
    </tbody>
  );

  const res = { prev: tr.prev - td.prev, real: tr.real - td.real };

  return (
    <AppShell title="DRE" subtitle="Demonstrativo do resultado — períodos planejados">
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Conta</th>
                <th className="px-4 py-3 text-right font-medium">Previsto</th>
                <th className="px-4 py-3 text-right font-medium">Realizado</th>
                <th className="px-4 py-3 text-right font-medium">Diferença</th>
              </tr>
            </thead>
            <Section title="Receitas" data={rec} total={tr} tipo="entrada" />
            <Section title="Despesas" data={desp} total={td} tipo="saida" />
            <tfoot>
              <tr className="border-t-2 border-foreground/20 bg-navy text-navy-foreground">
                <td className="px-4 py-3.5 font-semibold">Resultado do período</td>
                <td className="px-4 py-3.5 text-right font-semibold">{brl(res.prev)}</td>
                <td className="px-4 py-3.5 text-right font-semibold">{brl(res.real)}</td>
                <td className="px-4 py-3.5 text-right font-semibold">{res.real - res.prev > 0 ? "+" : ""}{brl(res.real - res.prev)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
