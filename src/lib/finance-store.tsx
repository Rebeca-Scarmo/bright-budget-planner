import { createContext, useContext, useState, type ReactNode } from "react";

export type Tipo = "entrada" | "saida";
export type Categoria = { id: string; nome: string; tipo: Tipo; subs: string[] };
export type Lancamento = {
  id: string; tipo: Tipo; data: string; descricao: string; valor: number;
  centro: string; categoriaId: string; sub: string; comprovante?: string;
};
export type Planejamento = {
  id: string; centro: string; periodo: string; entradaPrev: number; saidaPrev: number;
  categoriaId: string; sub: string;
};

export const CENTROS = ["Administrativo", "Clínica Centro", "Clínica Norte", "Comercial", "TI"];

function seedCategorias(): Categoria[] {
  return [
    { id: "c1", nome: "Serviços", tipo: "entrada", subs: ["Consultas", "Exames", "Procedimentos"] },
    { id: "c2", nome: "Convênios", tipo: "entrada", subs: ["Unimed", "Bradesco Saúde", "SulAmérica"] },
    { id: "c3", nome: "Pessoal", tipo: "saida", subs: ["Salários", "Encargos", "Benefícios"] },
    { id: "c4", nome: "Operacional", tipo: "saida", subs: ["Aluguel", "Energia", "Materiais"] },
    { id: "c5", nome: "Tecnologia", tipo: "saida", subs: ["Software", "Equipamentos"] },
    { id: "c6", nome: "Marketing", tipo: "saida", subs: ["Anúncios", "Eventos"] },
  ];
}

function seedLancamentos(): Lancamento[] {
  const rows: Omit<Lancamento, "id">[] = [];
  const months = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"];
  months.forEach((m, i) => {
    const k = 1 + i * 0.04;
    rows.push(
      { tipo: "entrada", data: `${m}-05`, descricao: "Faturamento consultas", valor: Math.round(48000 * k), centro: "Clínica Centro", categoriaId: "c1", sub: "Consultas", comprovante: "nf-consultas.pdf" },
      { tipo: "entrada", data: `${m}-12`, descricao: "Repasse convênio Unimed", valor: Math.round(31000 * k), centro: "Clínica Norte", categoriaId: "c2", sub: "Unimed", comprovante: "repasse.pdf" },
      { tipo: "entrada", data: `${m}-18`, descricao: "Exames laboratoriais", valor: Math.round(17500 * k), centro: "Clínica Centro", categoriaId: "c1", sub: "Exames" },
      { tipo: "saida", data: `${m}-05`, descricao: "Folha de pagamento", valor: Math.round(39000 * k), centro: "Administrativo", categoriaId: "c3", sub: "Salários", comprovante: "folha.pdf" },
      { tipo: "saida", data: `${m}-10`, descricao: "Aluguel sede", valor: 12000, centro: "Administrativo", categoriaId: "c4", sub: "Aluguel", comprovante: "boleto-aluguel.pdf" },
      { tipo: "saida", data: `${m}-15`, descricao: "Conta de energia", valor: Math.round(3200 * k), centro: "Clínica Centro", categoriaId: "c4", sub: "Energia" },
      { tipo: "saida", data: `${m}-20`, descricao: "Licenças de software", valor: 4800, centro: "TI", categoriaId: "c5", sub: "Software", comprovante: "fatura.pdf" },
      { tipo: "saida", data: `${m}-25`, descricao: "Campanha digital", valor: Math.round(5500 * k), centro: "Comercial", categoriaId: "c6", sub: "Anúncios" },
    );
  });
  return rows.map((r, i) => ({ ...r, id: `l${i + 1}` })).reverse();
}

function seedPlanejamentos(): Planejamento[] {
  return [
    { id: "p1", centro: "Clínica Centro", periodo: "2026-09", entradaPrev: 70000, saidaPrev: 5000, categoriaId: "c1", sub: "Consultas" },
    { id: "p2", centro: "Clínica Norte", periodo: "2026-09", entradaPrev: 36000, saidaPrev: 0, categoriaId: "c2", sub: "Unimed" },
    { id: "p3", centro: "Administrativo", periodo: "2026-09", entradaPrev: 0, saidaPrev: 58000, categoriaId: "c3", sub: "Salários" },
    { id: "p4", centro: "TI", periodo: "2026-09", entradaPrev: 0, saidaPrev: 5000, categoriaId: "c5", sub: "Software" },
    { id: "p5", centro: "Comercial", periodo: "2026-09", entradaPrev: 0, saidaPrev: 6000, categoriaId: "c6", sub: "Anúncios" },
    { id: "p6", centro: "Clínica Centro", periodo: "2026-08", entradaPrev: 66000, saidaPrev: 4500, categoriaId: "c1", sub: "Exames" },
    { id: "p7", centro: "Administrativo", periodo: "2026-08", entradaPrev: 0, saidaPrev: 56000, categoriaId: "c4", sub: "Aluguel" },
  ];
}

let seq = 1000;
export const newId = (p: string) => `${p}${++seq}`;

type Store = {
  categorias: Categoria[]; setCategorias: React.Dispatch<React.SetStateAction<Categoria[]>>;
  lancamentos: Lancamento[]; setLancamentos: React.Dispatch<React.SetStateAction<Lancamento[]>>;
  planejamentos: Planejamento[]; setPlanejamentos: React.Dispatch<React.SetStateAction<Planejamento[]>>;
};
const Ctx = createContext<Store | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [categorias, setCategorias] = useState(seedCategorias);
  const [lancamentos, setLancamentos] = useState(seedLancamentos);
  const [planejamentos, setPlanejamentos] = useState(seedPlanejamentos);
  return (
    <Ctx.Provider value={{ categorias, setCategorias, lancamentos, setLancamentos, planejamentos, setPlanejamentos }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFinance() {
  const c = useContext(Ctx);
  if (!c) throw new Error("FinanceProvider missing");
  return c;
}

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtDate = (d: string) => d.split("-").reverse().join("/");
export const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
export const fmtPeriodo = (p: string) => `${MESES[Number(p.slice(5, 7)) - 1]}/${p.slice(0, 4)}`;

export function realizado(l: Lancamento[], centro: string | null, periodo: string | null) {
  let e = 0, s = 0;
  for (const x of l) {
    if (centro && x.centro !== centro) continue;
    if (periodo && !x.data.startsWith(periodo)) continue;
    if (x.tipo === "entrada") e += x.valor; else s += x.valor;
  }
  return { e, s };
}
