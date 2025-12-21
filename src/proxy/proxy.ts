import { ProxyConfig, ProxyState } from '@/types'
export class ProxyPool {
  private proxies: ProxyState[] = []
  private index = 0

  constructor(proxyConfigs: ProxyConfig[]) {
    this.proxies = proxyConfigs.map(p => ({
      ...p,
      maxFails: p.maxFails ?? 3,
      cooldownMs: p.cooldownMs ?? 60_000,
      status: 'idle',
      fails: 0,
      lastUsedAt: null,
      cooldownUntil: null
    }))
  }

  /**
   * Lấy proxy khả dụng
   */
  getProxy(): ProxyState | null {
    const now = Date.now()

    // reset proxy hết cooldown
    for (const p of this.proxies) {
      if (p.status === 'cooldown' && p.cooldownUntil && p.cooldownUntil <= now) {
        p.status = 'idle'
        p.fails = 0
        p.cooldownUntil = null
      }
    }

    const available = this.proxies.filter(p => p.status === 'idle')

    if (available.length === 0) {
      return null
    }

    // round-robin
    const proxy = available[this.index % available.length]
    this.index++

    proxy.status = 'in-use'
    proxy.lastUsedAt = now

    return proxy
  }

  /**
   * Báo proxy thành công
   */
  success(proxyId: string) {
    const proxy = this.find(proxyId)
    if (!proxy) return

    proxy.status = 'idle'
    proxy.fails = 0
  }

  /**
   * Báo proxy thất bại (403, 429, timeout...)
   */
  fail(proxyId: string) {
    const proxy = this.find(proxyId)
    if (!proxy) return

    proxy.fails++

    if (proxy.fails >= (proxy.maxFails ?? 3)) {
      proxy.status = 'cooldown'
      proxy.cooldownUntil = Date.now() + (proxy.cooldownMs ?? 60_000)
    } else {
      proxy.status = 'idle'
    }
  }

  /**
   * Đánh dấu proxy chết hẳn
   */
  kill(proxyId: string) {
    const proxy = this.find(proxyId)
    if (!proxy) return

    proxy.status = 'dead'
  }

  stats() {
    return this.proxies.map(p => ({
      id: p.id,
      status: p.status,
      fails: p.fails,
      lastUsedAt: p.lastUsedAt
    }))
  }

  private find(id: string) {
    return this.proxies.find(p => p.id === id)
  }
}
