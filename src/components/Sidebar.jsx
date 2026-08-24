const NAV_ITEMS = [
  {
    id: 'inicio',
    label: 'Início',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12 11.204 3.045a1.125 1.125 0 0 1 1.591 0L21.75 12M4.5 9.75V20.25a.75.75 0 0 0 .75.75H9.75v-4.5a1.5 1.5 0 0 1 1.5-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v4.5h4.5a.75.75 0 0 0 .75-.75V9.75"
      />
    ),
  },
  {
    id: 'carteira',
    label: 'Carteira',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7.5A1.5 1.5 0 0 1 4.5 6h13.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 16.5v-9Z M3 10h18 M15 13.5h2.5"
      />
    ),
  },
]

export default function Sidebar({ active, onChange, onLogout }) {
  return (
    <aside className="hidden w-56 shrink-0 animate-fade-in flex-col border-r border-neutral-800 bg-neutral-900/40 lg:flex">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-sm font-bold text-white">
          M
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">Minha Carteira</span>
      </div>

      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-500/15 text-white'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                >
                  <svg
                    className="h-4.5 w-4.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ color: isActive ? '#009ee8' : undefined }}
                  >
                    {item.icon}
                  </svg>
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-neutral-800 px-3 py-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-neutral-200"
        >
          <svg
            className="h-4.5 w-4.5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 12H8.25m9.75 0-3-3m3 3-3 3"
            />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  )
}
