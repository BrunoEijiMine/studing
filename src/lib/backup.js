const APP_KEY = 'studing'
const BACKUP_VERSION = 1

export function downloadBackup(positions) {
  const payload = {
    app: APP_KEY,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    positions,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const date = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `studing-carteira-${date}.json`
  a.click()

  URL.revokeObjectURL(url)
}

function isValidPosition(item) {
  return (
    item &&
    typeof item.ticker === 'string' &&
    item.ticker.trim() !== '' &&
    Number.isFinite(item.quantity) &&
    item.quantity > 0 &&
    Number.isFinite(item.avgPrice) &&
    item.avgPrice >= 0
  )
}

/** Lê e valida um arquivo de backup, retornando a lista de posições. */
export async function parseBackupFile(file) {
  const text = await file.text()

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Esse arquivo não é um JSON válido.')
  }

  const positions = Array.isArray(data) ? data : data.positions

  if (!Array.isArray(positions)) {
    throw new Error('Esse arquivo não parece um backup do studing (falta a lista de posições).')
  }

  const valid = positions.filter(isValidPosition)
  if (valid.length === 0) {
    throw new Error('Nenhuma posição válida encontrada nesse backup.')
  }

  return valid.map((item) => ({
    id: typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID(),
    ticker: item.ticker.trim().toUpperCase(),
    quantity: item.quantity,
    avgPrice: item.avgPrice,
  }))
}
