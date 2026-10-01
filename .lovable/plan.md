# ISGV — Sistema de controle financeiro (front-end apenas)

Aplicação 100% front-end, dados mockados em memória (sem backend, sem banco, sem API).

## Visual
- SaaS corporativo (Linear/Stripe): fundo off-white creme, cards brancos com sombra leve, cantos suaves.
- Navbar superior fixa azul-escuro com logo "ISGV" e menu: Dashboard | Lançamentos | Planejamento | DRE | Categorias (link ativo destacado).
- Verde como cor de ação (botões, positivos); vermelho discreto para saídas/negativos.
- Fonte: Inter Tight / números tabulares para tabelas.
- Responsivo: menu vira hambúrguer no mobile; tabelas com rolagem horizontal.

## Telas (cada uma com rota real)
1. **Login** (`/`) — painel lateral azul com branding, formulário e-mail/senha/"esqueci minha senha"; "Entrar" leva ao Dashboard sem validar.
2. **Dashboard** (`/dashboard`) — 3 cards (Receitas, Despesas, Resultado: previsto x realizado), gráfico de barras previsto x realizado por mês, donut de despesas por categoria. Calculados a partir dos dados em memória.
3. **Lançamentos** (`/lancamentos`) — filtros funcionais (período de/até, tipo, categoria, subcategoria dependente, centro de custo, busca), resumo Entradas/Saídas/Resultado do filtrado, tabela com ícone de comprovante e ações:
   - Visualizar: modal só leitura
   - Editar: abre o mesmo formulário preenchido e salva
   - Excluir: confirmação e remoção
   - "+ Novo Lançamento": modal com tipo, data, descrição, valor, centro de custo, categoria, subcategoria, upload de comprovante (guarda o nome do arquivo). "Lançar" adiciona e fecha; "Cancelar" fecha sem salvar.
4. **Planejamento** (`/planejamento`) — tabela por centro de custo/período (entrada/saída prevista, realizado calculado dos lançamentos, resultado). "+ Novo Planejamento": centro de custo, período, entradas/saídas previstas, categoria, subcategoria; "Planejar" adiciona e fecha.
5. **DRE** (`/dre`) — relatório hierárquico Receitas/Despesas > categoria > subcategoria, colunas previsto/realizado/diferença, linhas recolhíveis e Resultado final.
6. **Categorias** (`/categorias`) — árvore de categorias (receita/despesa) e subcategorias com criar/editar/excluir.

## Detalhes técnicos
- Estado global via React Context (`src/lib/finance-store.tsx`) com arrays mockados iniciais (lançamentos, planejamentos, categorias, centros de custo); montado em `__root.tsx`. Reset ao recarregar.
- Rotas TanStack: `index.tsx` (login), `dashboard.tsx`, `lancamentos.tsx`, `planejamento.tsx`, `dre.tsx`, `categorias.tsx`; layout com navbar compartilhado em componente `AppShell` (fora do login). Cada rota com `head()` próprio.
- Gráficos com `recharts`; modais/selects com componentes shadcn (dialog, select, input, alert-dialog) e `sonner` para avisos.
- Tokens de cor em `src/styles.css` (oklch), sem cores fixas nos componentes.
