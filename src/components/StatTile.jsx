import { STATUS } from '../lib/palette'

export default function StatTile({ label, value, delta, deltaLabel }) {
  const hasDelta = delta !== undefined && delta !== null && !Number.isNaN(delta)
  const positive = hasDelta && delta >= 0

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
      <p className="text-xs text-neutral-400">{label}</p>
      <p
        className="mt-2 text-2xl font-semibold"
        style={{ color: hasDelta ? (positive ? STATUS.good : STATUS.critical) : '#ffffff' }}
      >
        {value}
      </p>
      {hasDelta && (
        <p
          className="mt-1 flex items-center gap-1 text-xs font-medium"
          style={{ color: positive ? STATUS.good : STATUS.critical }}
        >
          <span aria-hidden="true">{positive ? '▲' : '▼'}</span>
          {deltaLabel}
        </p>
      )}
    </div>
  )
}
