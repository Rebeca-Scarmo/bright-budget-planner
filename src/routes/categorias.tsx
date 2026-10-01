import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell, NativeSelect, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newId, useFinance, type Tipo } from "@/lib/finance-store";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — ISGV" },
      { name: "description", content: "Gerencie categorias e subcategorias de receitas e despesas." },
      { property: "og:title", content: "Categorias — ISGV" },
      { property: "og:description", content: "Gerencie categorias e subcategorias de receitas e despesas." },
    ],
  }),
  component: Categorias,
});

function Categorias() {
  const { categorias, setCategorias, lancamentos } = useFinance();
  const [novo, setNovo] = useState({ nome: "", tipo: "saida" as Tipo });
  const [edit, setEdit] = useState<{ key: string; value: string } | null>(null);
  const [newSub, setNewSub] = useState<Record<string, string>>({});

  const addCat = () => {
    if (!novo.nome.trim()) return;
    setCategorias((c) => [...c, { id: newId("c"), nome: novo.nome.trim(), tipo: novo.tipo, subs: [] }]);
    setNovo({ ...novo, nome: "" });
    toast.success("Categoria criada.");
  };
  const delCat = (id: string) => {
    if (lancamentos.some((l) => l.categoriaId === id)) return toast.error("Categoria possui lançamentos vinculados.");
    setCategorias((c) => c.filter((x) => x.id !== id));
  };
  const saveEdit = () => {
    if (!edit || !edit.value.trim()) return setEdit(null);
    const [id, sub] = edit.key.split("::");
    setCategorias((cs) => cs.map((c) => c.id !== id ? c : sub === undefined ? { ...c, nome: edit.value.trim() } : { ...c, subs: c.subs.map((s) => (s === sub ? edit.value.trim() : s)) }));
    setEdit(null);
  };

  const EditRow = () => (
    <div className="flex flex-1 items-center gap-1">
      <Input autoFocus className="h-8" value={edit!.value} onChange={(e) => setEdit({ ...edit!, value: e.target.value })} onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
      <button className="rounded p-1.5 text-success hover:bg-muted" onClick={saveEdit} aria-label="Salvar"><Check className="h-4 w-4" /></button>
      <button className="rounded p-1.5 text-muted-foreground hover:bg-muted" onClick={() => setEdit(null)} aria-label="Cancelar"><X className="h-4 w-4" /></button>
    </div>
  );
  const Act = ({ onEdit, onDel }: { onEdit: () => void; onDel: () => void }) => (
    <div className="flex gap-0.5 opacity-60 group-hover:opacity-100">
      <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={onEdit} aria-label="Editar"><Pencil className="h-3.5 w-3.5" /></button>
      <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive" onClick={onDel} aria-label="Excluir"><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );

  return (
    <AppShell title="Categorias" subtitle="Estrutura de contas usada em lançamentos, planejamento e DRE">
      <Panel className="mb-6 flex flex-wrap items-center gap-3 p-4">
        <Input className="max-w-xs" placeholder="Nome da nova categoria" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addCat()} />
        <NativeSelect className="w-36" value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value as Tipo })}>
          <option value="entrada">Receita</option><option value="saida">Despesa</option>
        </NativeSelect>
        <Button onClick={addCat}><Plus className="h-4 w-4" /> Criar categoria</Button>
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        {(["entrada", "saida"] as Tipo[]).map((t) => (
          <section key={t}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t === "entrada" ? "Receitas" : "Despesas"}</h2>
            <div className="space-y-3">
              {categorias.filter((c) => c.tipo === t).map((c) => (
                <Panel key={c.id} className="p-4">
                  <div className="group flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${t === "entrada" ? "bg-success" : "bg-destructive"}`} />
                    {edit?.key === c.id ? <EditRow /> : <>
                      <span className="flex-1 font-medium">{c.nome}</span>
                      <span className="text-xs text-muted-foreground">{c.subs.length} sub.</span>
                      <Act onEdit={() => setEdit({ key: c.id, value: c.nome })} onDel={() => delCat(c.id)} />
                    </>}
                  </div>
                  <ul className="mt-3 space-y-0.5 border-l pl-4 ml-1">
                    {c.subs.map((s) => (
                      <li key={s} className="group flex items-center gap-2 py-1 text-sm">
                        {edit?.key === `${c.id}::${s}` ? <EditRow /> : <>
                          <span className="flex-1 text-muted-foreground">{s}</span>
                          <Act onEdit={() => setEdit({ key: `${c.id}::${s}`, value: s })} onDel={() => setCategorias((cs) => cs.map((x) => x.id === c.id ? { ...x, subs: x.subs.filter((y) => y !== s) } : x))} />
                        </>}
                      </li>
                    ))}
                    <li className="flex items-center gap-2 pt-1">
                      <Input className="h-8 text-sm" placeholder="+ Nova subcategoria" value={newSub[c.id] ?? ""} onChange={(e) => setNewSub({ ...newSub, [c.id]: e.target.value })}
                        onKeyDown={(e) => {
                          const v = (newSub[c.id] ?? "").trim();
                          if (e.key === "Enter" && v && !c.subs.includes(v)) {
                            setCategorias((cs) => cs.map((x) => x.id === c.id ? { ...x, subs: [...x.subs, v] } : x));
                            setNewSub({ ...newSub, [c.id]: "" });
                          }
                        }} />
                    </li>
                  </ul>
                </Panel>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
