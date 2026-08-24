const TABS = [
  { id: 'inicio', label: 'Início' },
  { id: 'carteira', label: 'Carteira' },
]

export default function Tabs({ active, onChange }) {
  return (
    <div className="mb-6 flex gap-1 border-b border-neutral-800">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition ${
            active === tab.id
              ? 'border-b-2 border-blue-500 text-white'
              : 'border-b-2 border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
