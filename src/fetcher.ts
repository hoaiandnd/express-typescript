import { DriverBase } from '@/drivers/driver'
import { appendToCSV } from '@/excel/csv'
import { fetchWithProxy } from '@/proxy/proxy.pool'
import { CompanyDetail, CompanyRequestFilters } from '@/types'
import { crawler, sleep } from '@/utils'
import pLimit from 'p-limit'
export type TransformFunc<TResult = any> = (_detail: CompanyDetail | null) => TResult
export type FetchConfig<TTransformResult> = {
  requestFilters?: CompanyRequestFilters
  tranformFn?: TransformFunc<TTransformResult>
  filterFn?: (_data: CompanyDetail | null) => boolean
}

export abstract class FetcherBase {
  protected driver: DriverBase
  constructor(driver: DriverBase) {
    this.driver = driver
  }
  protected async fetchHtml(url: string) {
    try {
      const response = await crawler.get<string>(url)
      const resHtml = response.data
      return resHtml ?? 'NO_RESPONSE_DATA'
    } catch (err) {
      console.error((err as Error).message)
      return ''
    }
  }
}

export class Fetcher extends FetcherBase {
  async fetchCompanyLinks() {
    const responseHtml = await this.fetchHtml(this.driver.urlExtractor.url)
    const companyLinks = await this.driver.getCompanyLinks(responseHtml)
    return companyLinks
  }
  protected async fetchCompanyDetail(companyLink: string, filters?: CompanyRequestFilters) {
    const ms = Math.random() * 2000 + 3000
    console.log('Waiting for ' + ms + ' ms before fetching ' + companyLink)
    await sleep(ms)
    const html = await this.fetchHtml(companyLink)
    const result = await this.driver.getCompanyDetail(html)
    if (result && !this.driver.validate(result, filters)) {
      return null
    }
    return result
  }
  async fetchCompanyDetails(_filters?: CompanyRequestFilters) {
    const links = await this.fetchCompanyLinks()
    const limit = pLimit(5)
    const fetchPromises = links.map(link => limit(() => this.fetchCompanyDetail(link)))
    const fetchPromisesResult = await Promise.all(fetchPromises)
    return { nextPage: this.driver.nextPage(), pageResult: fetchPromisesResult }
  }
  async multiplePageFetch<TTransformResult = any>(config?: FetchConfig<TTransformResult>) {
    let maxPageCrawl = 7
    const results = [] as (CompanyDetail | TTransformResult | null)[]
    while (maxPageCrawl) {
      // results = [] as (CompanyDetail | TTransformResult | null)[]
      await sleep(Math.random() * 2000 + 3000)
      console.log('Dang cao du lieu')
      const pageResult = await this.fetchCompanyDetails(config?.requestFilters)
      const data = pageResult.pageResult.reduce<(CompanyDetail | TTransformResult | null)[]>((acc, item) => {
        if (!config?.filterFn || config?.filterFn?.(item)) {
          acc.push(config?.tranformFn ? config.tranformFn(item) : item)
        }
        return acc
      }, [])
      results.push(...data)

      console.log('Ket thuc cao du lieu')
      console.log('Tiep tuc voi trang ' + pageResult.nextPage.nextPageIndex)
      appendToCSV(
        './exports/output.csv',
        results.filter(r => r !== null && r !== undefined) as Record<string, unknown>[]
      )
      maxPageCrawl--
      results.length = 0
    }
    return results
  }
}
