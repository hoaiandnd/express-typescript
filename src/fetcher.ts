import { CompanyBaseDetail, DriverBase } from '@/drivers/driver'
import { CompanyFilters } from '@/types/request'
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
      // throw new Error('NO_RESPONSE_HTML')
      console.log('Loi fetch')
    }
  }
  protected async fetchCompanyDetail(companyLink: string, filter?: CompanyFilters) {
    const html = await this.fetchHtml(companyLink)
    const result = await this.driver.getCompanyDetail(html)
    if (!this.driver.validateCompanyDetail(result, filter)) {
      return null
    }
    return result
  }
  async fetchCompanyDetails(filters?: CompanyFilters) {
    const links = await this.fetchCompanyLinks()
    if (links.length <= 0)
      return {
        nextPage: this.driver.nextPage(),
        pageResult: [] as CompanyBaseDetail[]
      }

    //  kiểm tra theo ngày
    const finalCompanyLink = links[links.length - 1]
    const finalCompanyDetail = await this.fetchCompanyDetail(finalCompanyLink, filters)
    // thong tin cuoi cung khong thoa ma dieu kien ngay tim kiem
    if (!finalCompanyDetail)
      return {
        nextPage: this.driver.nextPage(),
        pageResult: [] as CompanyBaseDetail[]
      }

    const limit = pLimit(10)
    const fetchPromises = links.map(link => limit(() => this.fetchCompanyDetail(link)))
    const fetchPromisesResult = await Promise.all(fetchPromises)
    return { nextPage: this.driver.nextPage(), pageResult: fetchPromisesResult.filter(v => !!v) }
  }
  async multiplePageFetch(filters?: CompanyFilters) {
    let MAX_PAGE_COUNT = 5
    const results = [] as { phoneNumber: string; name?: string }[]
    while (--MAX_PAGE_COUNT) {
      console.log('Dang cao du lieu')
      const pageResult = await this.fetchCompanyDetails(filters)
      const data = pageResult.pageResult
        .map(pr => ({ phoneNumber: pr.phoneNumber, name: pr.name }))
        .filter(s => !!s.phoneNumber)
      results.push(...data)

      // const next = this.driver.nextPage()
      console.log('Tiep tuc voi trang ' + pageResult.nextPage.nextPageIndex)
      console.log('Ket thuc cao du lieu')
    }
    return results
  }
}
