export type ProxyStatus = 'idle' | 'in-use' | 'cooldown' | 'dead'

export interface ProxyConfig {
  id: string
  url: string // http://user:pass@ip:port
  maxFails?: number
  cooldownMs?: number
}

export interface ProxyState extends ProxyConfig {
  status: ProxyStatus
  fails: number
  lastUsedAt: number | null
  cooldownUntil: number | null
}
