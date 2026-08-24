// "Login" local — não é autenticação de verdade (não tem servidor pra validar
// contra). É só uma trava na tela: a senha nunca sai do navegador, e qualquer
// um com DevTools consegue ler os dados ou pular a checagem. Serve pra não
// abrir a carteira de cara pra quem passar na frente da tela.
const STORAGE_KEY = 'studing:auth'
const ITERATIONS = 150000

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

async function deriveHash(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return toHex(bits)
}

export function hasPassword() {
  return localStorage.getItem(STORAGE_KEY) !== null
}

export async function setPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await deriveHash(password, salt)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ salt: toHex(salt), hash }))
}

export async function verifyPassword(password) {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return false

  const { salt, hash } = JSON.parse(raw)
  const attempt = await deriveHash(password, fromHex(salt))
  return attempt === hash
}

export function resetPassword() {
  localStorage.removeItem(STORAGE_KEY)
}
