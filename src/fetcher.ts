import { DriverBase } from '@/drivers/driver'
import { appendToCSV } from '@/excel/csv'
import { AppConfigSchema, CompanyDetail, CompanyRequestFilters } from '@/types'
import { crawler, log, readJsonWithSchema, sleep } from '@/utils'
import pLimit from 'p-limit'
export type TransformFunc<TResult = any> = (_detail: CompanyDetail | null | undefined) => TResult
export type FetchConfig<TTransformResult> = {
  requestFilters?: CompanyRequestFilters
  tranformFn?: TransformFunc<TTransformResult>
  filterFn?: (_data: CompanyDetail | null | undefined) => boolean
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

const waitRandomTime = async () => {
  const ms = Math.random() * 1000 + 4000
  console.log('Waiting for ' + ms + ' ms before fetching')
  await sleep(ms)
}

export class FetchQueue {
  public static DEFAULT_CONCURRENCY_REQUEST_LIMIT = 5
  private concurrencyLimit: number
  private queue: (() => Promise<void>)[]
  private activeCount: number
  constructor() {
    this.concurrencyLimit = FetchQueue.DEFAULT_CONCURRENCY_REQUEST_LIMIT
    this.queue = []
    this.activeCount = 0
  }
  protected async readConfigs() {
    const parseResult = await readJsonWithSchema(AppConfigSchema, 'configs.json')
    if (!parseResult.isSuccess) {
      throw new Error('APP_ERROR_FAILED_TO_LOAD_CONFIG')
    }
    this.concurrencyLimit = parseResult.data.concurrencyRequestLimit ?? FetchQueue.DEFAULT_CONCURRENCY_REQUEST_LIMIT
  }
  public async getLimiter() {
    await this.readConfigs()

    return pLimit(this.concurrencyLimit)
  }
}

export class Fetcher extends FetcherBase {
  async fetchCompanyLinks() {
    const responseHtml = await this.fetchHtml(this.driver.urlExtractor.url)
    const companyLinks = await this.driver.getCompanyLinks(responseHtml)
    return companyLinks
  }
  protected async fetchCompanyDetail(companyLink: string, filters?: CompanyRequestFilters) {
    try {
      // chờ random trước khi gửi request
      await waitRandomTime()
      const html = await this.fetchHtml(companyLink)
      // từ html, lấy ra dữ liệu thông tin công ty
      const result = await this.driver.getCompanyDetail(html)
      // nếu lấy được thông tin, kiểm  tra xem có hợp lệ không (dựa vào phương thức `validate` được định nghĩa ở từng driver) và hàm `filters` được truyền vào (nếu có)
      if (result) {
        const validatedResult = await this.driver.validate(result, filters)
        // trả về kết quả theo điều kiện
        return validatedResult ? result : null
      }
      // trả về `null` nếu không lấy được thông tin công ty
      return result
    } catch (err) {
      console.log('Error occured at `fetchCompanyDetail` method. Link: ' + companyLink)
      console.log((err as Error).message)
    }
  }
  async fetchCompanyDetails(_filters?: CompanyRequestFilters) {
    try {
      // lấy danh sách các link trang chi tiết của các công ty
      const links = await this.fetchCompanyLinks()
      // đọc file cấu hình
      const parseResult = await readJsonWithSchema(AppConfigSchema, 'configs.json')
      if (!parseResult.isSuccess) {
        throw new Error('FAILED_TO_LOAD_CONFIG')
      }
      const fetchQueue = new FetchQueue()
      const limiter = await fetchQueue.getLimiter()
      const fetchPromises = links.map(link => limiter(() => this.fetchCompanyDetail(link)))
      const fetchPromisesResult = await Promise.all(fetchPromises)
      return { nextPage: this.driver.nextPage(), pageResult: fetchPromisesResult }
    } catch (err) {
      console.log('Error occured at `fetchCompanyDetails` method.')
      console.error((err as Error).message)
    }
  }
  async multiplePageFetch<TTransformResult = any>(config?: FetchConfig<TTransformResult>) {
    const parseResult = await readJsonWithSchema(AppConfigSchema, 'configs.json')
    if (!parseResult.isSuccess) {
      console.error('Failed to load driver config')
      return []
    }
    let { maxPagesToCrawl } = parseResult.data
    const results = [] as (CompanyDetail | TTransformResult | null)[]
    while (maxPagesToCrawl) {
      console.log('Dang cao du lieu')
      const pageResult = await this.fetchCompanyDetails(config?.requestFilters)
      const data = pageResult?.pageResult.reduce<(CompanyDetail | TTransformResult | null)[]>((acc, item) => {
        if ((item && !config?.filterFn) || config?.filterFn?.(item)) {
          const transformedItem = config?.tranformFn ? config.tranformFn(item) : item
          if (transformedItem) acc.push(transformedItem)
        }
        return acc
      }, [])
      if (!data || data.length === 0) {
        await log(`Khong co du lieu de tiep tuc - current page is ${pageResult?.nextPage?.nextPageIndex ?? 1 - 1 + ''}`)
        return []
      }
      results.push(...(data ?? []))

      console.log('Ket thuc cao du lieu')
      console.log('Tiep tuc voi trang ' + pageResult?.nextPage.nextPageIndex)
      appendToCSV(
        './exports/binh_duong_384.csv',
        results.filter(r => r !== null && r !== undefined) as Record<string, unknown>[]
      )
      maxPagesToCrawl--
      results.length = 0
    }
    return results
  }
}
