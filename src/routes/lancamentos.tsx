import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Paperclip, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Field, NativeSelect, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { brl, CENTROS, fmtDate, newId, useFinance, type Lancamento, type Tipo } from "@/lib/finance-store";

export const Route = createFileRoute("/lancamentos")({
  head: () => ({
    meta: [
      { title: "Lançamentos — ISGV" },
      { name: "description", content: "Registre e filtre entradas e saídas por categoria e centro de custo." },
      { property: "og:title", content: "Lançamentos — ISGV" },
      { property: "og:description", content: "Registre e filtre entradas e saídas por categoria e centro de custo." },
    ],
  }),
  component: Lancamentos,
});

type Draft = Omit<Lancamento, "id" | "valor"> & { valor: string };
const emptyDraft = (): Draft => ({ tipo: "saida", data: "2026-10-01", descricao: "", valor: "", centro: "", categoriaId: "", sub: "", comprovante: undefined });

function Lancamentos() {
  const { lancamentos, setLancamentos, categorias } = useFinance();
  const [f, setF] = useState({ de: "", ate: "", tipo: "", cat: "", sub: "", centro: "", q: "" });
  const [form, setForm] = useState<{ open: boolean; editId: string | null; d: Draft }>({ open: false, editId: null, d: emptyDraft() });
  const [view, setView] = useState<Lancamento | null>(null);
  const [del, setDel] = useState<Lancamento | null>(null);

  const catName = (id: string) => categorias.find((c) => c.id === id)?.nome ?? "—";
  const subsOf = (id: string) => categorias.find((c) => c.id === id)?.subs ?? [];

  const rows = useMemo(() => lancamentos.filter((l) =>
    (!f.de || l.data >= f.de) && (!f.ate || l.data <= f.ate) && (!f.tipo || l.tipo === f.tipo) &&
    (!f.cat || l.categoriaId === f.cat) && (!f.sub || l.sub === f.sub) && (!f.centro || l.centro === f.centro) &&
    (!f.q || l.descricao.toLowerCase().includes(f.q.toLowerCase()))
  ).sort((a, b) => b.data.localeCompare(a.data)), [lancamentos, f]);

  const ent = rows.filter((r) => r.tipo === "entrada").reduce((a, r) => a + r.valor, 0);
  const sai = rows.filter((r) => r.tipo === "saida").reduce((a, r) => a + r.valor, 0);

  const d = form.d;
  const setD = (p: Partial<Draft>) => setForm((s) => ({ ...s, d: { ...s.d, ...p } }));

  function save() {
    const valor = Number(d.valor.replace(",", "."));
    if (!d.descricao || !d.data || !d.centro || !d.categoriaId || !(valor > 0)) {
      toast.error("Preencha descrição, data, valor, centro de custo e categoria.");
      return;
    }
    const rec = { ...d, valor };
    if (form.editId) {
      setLancamentos((ls) => ls.map((l) => (l.id === form.editId ? { ...rec, id: l.id } : l)));
      toast.success("Lançamento atualizado.");
    } else {
      setLancamentos((ls) => [{ ...rec, id: newId("l") }, ...ls]);
      toast.success("Lançamento adicionado.");
    }
    setForm({ open: false, editId: null, d: emptyDraft() });
  }

  const hasFilter = Object.values(f).some(Boolean);

  return (
    <AppShell
      title="Lançamentos"
      subtitle="Entradas e saídas registradas"
      actions={<Button onClick={() => setForm({ open: true, editId: null, d: emptyDraft() })}><Plus className="h-4 w-4" /> Novo Lançamento</Button>}
    >
      <Panel className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          <Field label="De"><Input type="date" value={f.de} onChange={(e) => setF({ ...f, de: e.target.value })} /></Field>
          <Field label="Até"><Input type="date" value={f.ate} onChange={(e) => setF({ ...f, ate: e.target.value })} /></Field>
          <Field label="Tipo">
            <NativeSelect value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
              <option value="">Todos</option><option value="entrada">Entrada</option><option value="saida">Saída</option>
            </NativeSelect>
          </Field>
          <Field label="Categoria">
            <NativeSelect value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value, sub: "" })}>
              <option value="">Todas</option>
              {categorias.filter((c) => !f.tipo || c.tipo === f.tipo).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subcategoria">
            <NativeSelect value={f.sub} disabled={!f.cat} onChange={(e) => setF({ ...f, sub: e.target.value })}>
              <option value="">Todas</option>
              {subsOf(f.cat).map((s) => <option key={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Centro de custo">
            <NativeSelect value={f.centro} onChange={(e) => setF({ ...f, centro: e.target.value })}>
              <option value="">Todos</option>
              {CENTROS.map((c) => <option key={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Busca">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Descrição" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
            </div>
          </Field>
        </div>
        {hasFilter && (
          <button className="mt-3 text-xs font-medium text-primary hover:underline" onClick={() => setF({ de: "", ate: "", tipo: "", cat: "", sub: "", centro: "", q: "" })}>Limpar filtros</button>
        )}
      </Panel>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[["Entradas", ent, "text-success"], ["Saídas", sai, "text-destructive"], ["Resultado", ent - sai, ent - sai >= 0 ? "text-success" : "text-destructive"]].map(([l, v, c]) => (
          <Panel key={l as string} className="px-5 py-4">
            <div className="text-xs font-medium text-muted-foreground">{l as string}</div>
            <div className={`mt-1 text-xl font-semibold ${c}`}>{brl(v as number)}</div>
          </Panel>
        ))}
      </div>

      <Panel className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="border-b bg-muted/60 text-left text-xs font-medium text-muted-foreground">
              <tr>
                {["Data", "Descrição", "Tipo", "Categoria", "Subcategoria", "Centro de custo"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
                <th className="px-4 py-3 text-right font-medium">Valor</th>
                <th className="px-4 py-3 text-center font-medium">Comprov.</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((l) => (
                <tr key={l.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(l.data)}</td>
                  <td className="px-4 py-3 font-medium">{l.descricao}</td>
                  <td className="px-4 py-3"><TipoBadge t={l.tipo} /></td>
                  <td className="px-4 py-3">{catName(l.categoriaId)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.sub || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.centro}</td>
                  <td className={`px-4 py-3 text-right font-medium ${l.tipo === "entrada" ? "text-success" : "text-destructive"}`}>{l.tipo === "saida" && "− "}{brl(l.valor)}</td>
                  <td className="px-4 py-3 text-center">{l.comprovante ? <Paperclip className="mx-auto h-4 w-4 text-primary" aria-label="Com comprovante" /> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <IconBtn label="Visualizar" onClick={() => setView(l)}><Eye className="h-4 w-4" /></IconBtn>
                      <IconBtn label="Editar" onClick={() => setForm({ open: true, editId: l.id, d: { ...l, valor: String(l.valor) } })}><Pencil className="h-4 w-4" /></IconBtn>
                      <IconBtn label="Excluir" onClick={() => setDel(l)}><Trash2 className="h-4 w-4" /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">Nenhum lançamento encontrado com os filtros atuais.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Dialog open={form.open} onOpenChange={(o) => !o && setForm({ open: false, editId: null, d: emptyDraft() })}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{form.editId ? "Editar lançamento" : "Novo lançamento"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo">
              <NativeSelect value={d.tipo} onChange={(e) => setD({ tipo: e.target.value as Tipo, categoriaId: "", sub: "" })}>
                <option value="entrada">Entrada</option><option value="saida">Saída</option>
              </NativeSelect>
            </Field>
            <Field label="Data"><Input type="date" value={d.data} onChange={(e) => setD({ data: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Descrição"><Input value={d.descricao} onChange={(e) => setD({ descricao: e.target.value })} placeholder="Ex.: Pagamento fornecedor" /></Field></div>
            <Field label="Valor (R$)"><Input inputMode="decimal" value={d.valor} onChange={(e) => setD({ valor: e.target.value })} placeholder="0,00" /></Field>
            <Field label="Centro de custo">
              <NativeSelect value={d.centro} onChange={(e) => setD({ centro: e.target.value })}>
                <option value="">Selecione</option>{CENTROS.map((c) => <option key={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Categoria">
              <NativeSelect value={d.categoriaId} onChange={(e) => setD({ categoriaId: e.target.value, sub: "" })}>
                <option value="">Selecione</option>
                {categorias.filter((c) => c.tipo === d.tipo).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Subcategoria">
              <NativeSelect value={d.sub} disabled={!d.categoriaId} onChange={(e) => setD({ sub: e.target.value })}>
                <option value="">Selecione</option>{subsOf(d.categoriaId).map((s) => <option key={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Comprovante">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-3 py-3 text-sm text-muted-foreground hover:bg-muted/50">
                  <Paperclip className="h-4 w-4" />
                  <span className="truncate">{d.comprovante ?? "Anexar arquivo (PDF, imagem)"}</span>
                  <input type="file" className="hidden" onChange={(e) => setD({ comprovante: e.target.files?.[0]?.name })} />
                </label>
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm({ open: false, editId: null, d: emptyDraft() })}>Cancelar</Button>
            <Button onClick={save}>{form.editId ? "Salvar" : "Lançar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalhes do lançamento</DialogTitle></DialogHeader>
          {view && (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {[["Descrição", view.descricao], ["Data", fmtDate(view.data)], ["Tipo", view.tipo === "entrada" ? "Entrada" : "Saída"], ["Valor", brl(view.valor)],
                ["Categoria", catName(view.categoriaId)], ["Subcategoria", view.sub || "—"], ["Centro de custo", view.centro], ["Comprovante", view.comprovante ?? "Não anexado"]].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>
              ))}
            </dl>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setView(null)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>"{del?.descricao}" será removido. Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { setLancamentos((ls) => ls.filter((l) => l.id !== del?.id)); toast.success("Lançamento excluído."); setDel(null); }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function TipoBadge({ t }: { t: Tipo }) {
  return t === "entrada"
    ? <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">Entrada</span>
    : <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Saída</span>;
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button aria-label={label} title={label} onClick={onClick} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">{children}</button>;
}
