import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo, Field } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — ISGV" },
      { name: "description", content: "Acesse o ISGV, plataforma de controle financeiro gerencial." },
      { property: "og:title", content: "Entrar — ISGV" },
      { property: "og:description", content: "Acesse o ISGV, plataforma de controle financeiro gerencial." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 text-navy-foreground lg:flex">
        <Logo className="text-lg" />
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">Previsto e realizado, lado a lado.</h2>
          <p className="mt-4 text-navy-muted">Controle financeiro gerencial para clínicas, hospitais, escritórios e empresas — com clareza para decidir.</p>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-navy-accent pt-6 text-sm">
            <div><div className="text-xl font-semibold">DRE</div><div className="text-navy-muted">gerencial</div></div>
            <div><div className="text-xl font-semibold">Centros</div><div className="text-navy-muted">de custo</div></div>
            <div><div className="text-xl font-semibold">Metas</div><div className="text-navy-muted">por período</div></div>
          </div>
        </div>
        <p className="text-xs text-navy-muted">© 2026 ISGV</p>
        <svg className="absolute -right-24 top-24 h-[480px] w-[480px] opacity-20" viewBox="0 0 200 200" aria-hidden>
          {[20, 45, 70, 95].map((r) => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="0.6" />)}
        </svg>
      </aside>
      <div className="flex items-center justify-center p-6">
        <form
          className="w-full max-w-sm"
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }}
        >
          <Logo className="mb-10 text-foreground lg:hidden" />
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acesse sua conta para continuar.</p>
          <div className="mt-8 space-y-4">
            <Field label="E-mail"><Input type="email" placeholder="voce@empresa.com.br" /></Field>
            <Field label="Senha"><Input type="password" placeholder="••••••••" /></Field>
            <div className="flex justify-end">
              <button type="button" className="text-sm font-medium text-primary hover:underline" onClick={() => toast.info("Instruções de recuperação enviadas (demonstração).")}>Esqueci minha senha</button>
            </div>
            <Button type="submit" className="w-full">Entrar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
