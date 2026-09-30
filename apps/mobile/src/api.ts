import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// 실제 기기에서는 PC 의 LAN IP 로 바꿔야 한다. 예) EXPO_PUBLIC_API_URL=http://192.168.0.10:4000
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'

const TOKEN_KEY = 'cote.token'

// 토큰 저장: 기기는 SecureStore, 웹 미리보기는 localStorage
export async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null
    return await SecureStore.getItemAsync(TOKEN_KEY)
  } catch {
    return null
  }
}

export async function setToken(token: string | null) {
  try {
    if (Platform.OS === 'web') {
      if (token) globalThis.localStorage?.setItem(TOKEN_KEY, token)
      else globalThis.localStorage?.removeItem(TOKEN_KEY)
      return
    }
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token)
    else await SecureStore.deleteItemAsync(TOKEN_KEY)
  } catch {
    // 저장할 수 없는 환경이면 이번 실행 동안만 유지된다
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) }
  const token = await getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  let body = init.body
  if (init.json !== undefined) {
    headers['content-type'] = 'application/json'
    body = JSON.stringify(init.json)
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers, body })
  if (!res.ok) {
    let message = res.statusText
    try {
      const data = await res.json()
      message = Array.isArray(data.message) ? data.message.join(', ') : (data.message ?? message)
    } catch {
      // JSON 이 아닌 에러 본문
    }
    throw new ApiError(res.status, message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
