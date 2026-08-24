import { useRef, useState } from 'react'
import { downloadBackup, parseBackupFile } from '../lib/backup'

export default function BackupControls({ positions, onImport }) {
  const fileInputRef = useRef(null)
  const [error, setError] = useState(null)

  const handleExport = () => {
    if (positions.length === 0) return
    downloadBackup(positions)
  }

  const handleImportClick = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      const imported = await parseBackupFile(file)

      if (positions.length > 0) {
        const confirmed = window.confirm(
          `Isso vai substituir sua carteira atual (${positions.length} posições) pelas ${imported.length} posições do backup. Continuar?`
        )
        if (!confirmed) return
      }

      onImport(imported)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
      <button
        type="button"
        onClick={handleExport}
        disabled={positions.length === 0}
        className="underline underline-offset-2 transition hover:text-neutral-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
      >
        exportar backup (.json)
      </button>
      <span className="text-neutral-700">·</span>
      <button
        type="button"
        onClick={handleImportClick}
        className="underline underline-offset-2 transition hover:text-neutral-300"
      >
        importar backup (.json)
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <span className="text-rose-400">{error}</span>}
    </div>
  )
}
