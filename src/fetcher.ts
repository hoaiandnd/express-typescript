import { DriverBase } from '@/drivers/driver'
import { loadConfigs } from '@/loaders'
import { CompanyDetail } from '@/types'
import { CompanyFilters } from '@/types/request'
import { crawler } from '@/utils/config'
import pLimit from 'p-limit'
export type TransformFunc<TResult = any> = (detail: CompanyDetail | null) => TResult
export type FetchConfig<TTransformResult> = {
  filters?: CompanyFilters
  tranformFn?: TransformFunc<TTransformResult>
  filterFn?: (data: CompanyDetail | null) => boolean
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
      console.log('FETCH_FAILED')
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
  protected async fetchCompanyDetail(companyLink: string, filters?: CompanyFilters) {
    const html = await this.fetchHtml(companyLink)
    const result = await this.driver.getCompanyDetail(html)
    if (result && !this.driver.validate(result, filters)) {
      return null
    }
    return result
  }
  async fetchCompanyDetails(filters?: CompanyFilters) {
    const links = await this.fetchCompanyLinks()
    const limit = pLimit(10)
    const fetchPromises = links.map(link => limit(() => this.fetchCompanyDetail(link)))
    const fetchPromisesResult = await Promise.all(fetchPromises)
    return { nextPage: this.driver.nextPage(), pageResult: fetchPromisesResult }
  }
  async multiplePageFetch<TTransformResult = any>(config?: FetchConfig<TTransformResult>) {
    let MAX_PAGE_COUNT = (await loadConfigs('maxPageCount')) ?? 10
    const results = [] as (CompanyDetail | TTransformResult | null)[]
    while (MAX_PAGE_COUNT) {
      console.log('Dang cao du lieu')
      const pageResult = await this.fetchCompanyDetails(config?.filters)
      const data = pageResult.pageResult.reduce<(CompanyDetail | TTransformResult | null)[]>((acc, item) => {
        if (!config?.filterFn || config?.filterFn?.(item)) {
          acc.push(config?.tranformFn ? config.tranformFn(item) : item)
        }
        return acc
      }, [])
      results.push(...data)

      console.log('Ket thuc cao du lieu')
      console.log('Tiep tuc voi trang ' + pageResult.nextPage.nextPageIndex)
      MAX_PAGE_COUNT--
    }
    return results
  }
}
