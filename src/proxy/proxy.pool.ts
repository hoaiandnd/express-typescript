import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { ProxyPool } from './proxy'

const pool = new ProxyPool([
  { id: 'p1', url: 'http://user:pass@ip1:port' },
  { id: 'p2', url: 'http://user:pass@ip2:port' }
])

export async function fetchWithProxy(url: string) {
  const proxy = pool.getProxy()
  if (!proxy) throw new Error('No proxy available')

  try {
    const agent = new HttpsProxyAgent(proxy.url)

    const res = await axios.get(url, {
      httpsAgent: agent,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    pool.success(proxy.id)
    return res.data
  } catch (err: any) {
    pool.fail(proxy.id)
    throw err
  }
}
