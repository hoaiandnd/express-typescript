import { DriverBase, IDriver } from '@/drivers/driver'
import { crawler } from '@/utils/config'
import pLimit from 'p-limit'

export class Fetcher {
  protected driver: DriverBase
  constructor(driver: DriverBase) {
    this.driver = driver
  }
  async fetchCompanyLinks() {
    const responseHtml = await this.fetchHtml(this.driver.urlExtractor.url)
    const companyLinks = await this.driver.getCompanyLinks(responseHtml)
    return companyLinks
  }
  protected async fetchHtml(url: string) {
    try {
      const response = await crawler.get(url)
      // Trả về dữ liệu bạn cần (ví dụ: HTML string hoặc JSON data)
      const resHtml = response.data
      if (!resHtml) {
        return 'No number html'
      }
      return resHtml
    } catch {
      throw new Error('NO_RESPONSE_HTML')
    }
  }
  protected async fetchCompanyDetail(companyLink: string) {
    const html = await this.fetchHtml(companyLink)
    const result = await this.driver.getCompanyDetail(html)
    return result
  }
  async fetchCompanyDetails() {
    const links = await this.fetchCompanyLinks()
    const limit = pLimit(10)
    const fetchPromises = links.map(link => limit(() => this.fetchCompanyDetail(link)))
    const fetchPromisesResult = await Promise.all(fetchPromises)
    return { nextPage: this.driver.nextPage(), pageResult: fetchPromisesResult }
  }
  async multiplePageFetch() {}
}
