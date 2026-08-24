# Minha Carteira

Painel pessoal para acompanhar uma carteira de ações e FIIs da B3: cotações em tempo real, alocação por ativo, lucro/prejuízo e importação/backup dos seus dados — tudo rodando no navegador, sem servidor ou conta.

## Funcionalidades

- **Início** — visão geral da carteira: patrimônio total, desempenho, maiores posições, alocação por ativo (ações e FIIs) e gráfico de lucro/prejuízo por ativo.
- **Carteira** — cadastro de posições (ticker, quantidade, preço médio), separadas em abas de Ações e FIIs. A classificação é automática, baseada na cotação de cada ativo.
- **Cotações em tempo real** via [brapi.dev](https://brapi.dev), buscadas ao abrir a página e sob demanda (sem polling automático em segundo plano, pra não estourar o limite de requests do plano gratuito).
- **Importação em massa** de extratos (CSV, TXT colado ou Excel), com detecção automática de colunas.
- **Backup/restauração** da carteira em um arquivo `.json`.
- Tudo fica salvo no `localStorage` do navegador — nenhum dado sai da sua máquina além das cotações consultadas na brapi.dev.

## Rodando localmente

Pré-requisitos: Node.js 18+.

```bash
npm install
cp .env.example .env
```

Edite o `.env` e adicione um token gratuito da [brapi.dev](https://brapi.dev/dashboard) em `VITE_BRAPI_TOKEN` (necessário para buscar cotações).

```bash
npm run dev
```

Abre em `http://localhost:5173`.

## Scripts

| Comando           | O que faz                          |
| ------------------ | ----------------------------------- |
| `npm run dev`       | inicia o servidor de desenvolvimento |
| `npm run build`     | build de produção (`dist/`)         |
| `npm run preview`   | serve o build de produção localmente |
| `npm run lint`      | roda o oxlint                       |

## Stack

- [React](https://react.dev) + [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [brapi.dev](https://brapi.dev) para cotações da B3
- `read-excel-file` para importação de planilhas `.xlsx`
