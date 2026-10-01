import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Field, NativeSelect, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brl, CENTROS, fmtPeriodo, newId, realizado, useFinance } from "@/lib/finance-store";

export const Route = createFileRoute("/planejamento")({
  head: () => ({
    meta: [
      { title: "Planejamento — ISGV" },
      { name: "description", content: "Metas de entradas e saídas por centro de custo e período." },
      { property: "og:title", content: "Planejamento — ISGV" },
      { property: "og:description", content: "Metas de entradas e saídas por centro de custo e período." },
    ],
  }),
  component: Planejamento,
});

const empty = { centro: "", periodo: "2026-10", entradaPrev: "", saidaPrev: "", categoriaId: "", sub: "" };

function Planejamento() {
  const { planejamentos, setPlanejamentos, lancamentos, categorias } = useFinance();
  const [open, setOpen] = useState(false);
  const [d, setD] = useState(empty);
  const close = () => { setOpen(false); setD(empty); };
  const num = (s: string) => Number(s.replace(",", ".")) || 0;

  function save() {
    if (!d.centro || !d.periodo || !d.categoriaId || (num(d.entradaPrev) <= 0 && num(d.saidaPrev) <= 0)) {
      toast.error("Informe centro de custo, período, categoria e ao menos um valor previsto.");
      return;
    }
    setPlanejamentos((p) => [{ id: newId("p"), centro: d.centro, periodo: d.periodo, entradaPrev: num(d.entradaPrev), saidaPrev: num(d.saidaPrev), categoriaId: d.categoriaId, sub: d.sub }, ...p]);
    toast.success("Planejamento adicionado.");
    close();
  }

  const rows = [...planejamentos].sort((a, b) => b.periodo.localeCompare(a.periodo) || a.centro.localeCompare(b.centro));
  const subs = categorias.find((c) => c.id === d.categoriaId)?.subs ?? [];

  return (
    <AppShell title="Planejamento" subtitle="Previsto x realizado por centro de custo" actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo Planejamento</Button>}>
      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Centro de custo</th>
                <th className="px-4 py-3 text-left font-medium">Período</th>
                <th className="px-4 py-3 text-left font-medium">Categoria</th>
                {["Entrada prevista", "Saída prevista", "Entrada realizada", "Saída realizada", "Resultado"].map((h) => <th key={h} className="px-4 py-3 text-right font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((p) => {
                const r = realizado(lancamentos, p.centro, p.periodo);
                const res = r.e - r.s;
                const cat = categorias.find((c) => c.id === p.categoriaId);
                return (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{p.centro}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtPeriodo(p.periodo)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cat?.nome ?? "—"}{p.sub && ` · ${p.sub}`}</td>
                    <td className="px-4 py-3 text-right">{brl(p.entradaPrev)}</td>
                    <td className="px-4 py-3 text-right">{brl(p.saidaPrev)}</td>
                    <td className="px-4 py-3 text-right text-success">{brl(r.e)}</td>
                    <td className="px-4 py-3 text-right text-destructive">{brl(r.s)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${res >= 0 ? "text-success" : "text-destructive"}`}>{brl(res)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Dialog open={open} onOpenChange={(o) => !o && close()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Novo planejamento</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Centro de custo">
              <NativeSelect value={d.centro} onChange={(e) => setD({ ...d, centro: e.target.value })}>
                <option value="">Selecione</option>{CENTROS.map((c) => <option key={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Período"><Input type="month" value={d.periodo} onChange={(e) => setD({ ...d, periodo: e.target.value })} /></Field>
            <Field label="Entrada prevista (R$)"><Input inputMode="decimal" placeholder="0,00" value={d.entradaPrev} onChange={(e) => setD({ ...d, entradaPrev: e.target.value })} /></Field>
            <Field label="Saída prevista (R$)"><Input inputMode="decimal" placeholder="0,00" value={d.saidaPrev} onChange={(e) => setD({ ...d, saidaPrev: e.target.value })} /></Field>
            <Field label="Categoria">
              <NativeSelect value={d.categoriaId} onChange={(e) => setD({ ...d, categoriaId: e.target.value, sub: "" })}>
                <option value="">Selecione</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Subcategoria">
              <NativeSelect value={d.sub} disabled={!d.categoriaId} onChange={(e) => setD({ ...d, sub: e.target.value })}>
                <option value="">Selecione</option>{subs.map((s) => <option key={s}>{s}</option>)}
              </NativeSelect>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancelar</Button>
            <Button onClick={save}>Planejar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
