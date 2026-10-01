# Mocked Finance Dashboard

REQUISITOS FUNCIONAIS (front-end apenas, sem backend)

- Implementar como aplicação React com roteamento real entre as páginas 

  (Dashboard, Lançamentos, Planejamento, DRE, Categorias) — a navegação pela 

  navbar deve trocar de tela de verdade, não só mudar visual.

- Dados mockados em arrays estáticos no próprio front-end (sem Supabase, sem 

  banco de dados, sem chamadas de API reais).

- Os formulários "Novo Lançamento" e "Novo Planejamento" devem funcionar: ao 

  preencher os campos e clicar em "Lançar"/"Planejar", o registro deve ser 

  adicionado de verdade à tabela correspondente (atualizando o estado local da 

  aplicação), e o modal deve fechar automaticamente.

- O botão "Cancelar" deve fechar o modal sem salvar nada.

- Os filtros da tela de Lançamentos (período, tipo, categoria, subcategoria, 

  centro de custo, busca por descrição) devem filtrar de verdade os dados 

  exibidos na tabela mockada.

- As ações de "visualizar/editar/excluir" na tabela de Lançamentos devem ter 

  comportamento funcional básico sobre os dados mockados (não precisam persistir 

  após recarregar a página).

- Não implementar autenticação real — o login pode redirecionar direto para o 

  Dashboard ao clicar em "entrar", sem validação de credenciais.

NÃO FAZER

- Não conectar a nenhum backend, API externa ou banco de dados real.

- Não usar Supabase ou qualquer serviço de persistência — tudo em memória/estado 

  local do React.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ee2abecc-a68c-4877-8785-8adc2018c194).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
