import { UrlExtractor } from '@/utils/url'
import path from 'path'
import fs from 'fs/promises'
import { CheerioAPI } from 'cheerio'
export type NextPage = { nextPageIndex: number; nextPageUrl: string }
export interface IDriver {
  combineLink(): string
  getCompanyLinks(html: string): string[] | Promise<string[]>
  getCompanyDetail(html: string): CompanyBaseDetail | Promise<CompanyBaseDetail>
  nextPage(): NextPage
}
export type CompanyBaseDetail = {
  name?: string
  phoneNumber: string
  taxCode?: string
  address?: string
  startDate?: string
  founder?: string
}
export abstract class DriverBase implements IDriver {
  constructor(protected _urlExtractor: UrlExtractor) {
    this._urlExtractor = _urlExtractor
  }
  get urlExtractor() {
    return this._urlExtractor
  }
  protected async loadDriverJson(name?: string) {
    const fileName = name ?? `${this._urlExtractor.domain}.json`
    const filePath = path.join(__dirname, 'jsons', fileName)
    const json = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(json)
  }
  protected async getProperty(path: string, defaultValue?: string, seperator: string = '.') {
    const obj = await this.loadDriverJson()
    const result = path.split(seperator).reduce((acc, key) => acc?.[key], obj)
    return result ?? defaultValue
  }
  protected async crawlProperty($: CheerioAPI, selectorKey: string) {
    const selector = await this.getProperty(selectorKey)
    if (selector) return $(selector)
    else return undefined
  }
  protected async crawl($: CheerioAPI) {
    const $phone = await this.crawlProperty($, 'selectors.companyDetail.phoneNumber')
    const $name = await this.crawlProperty($, 'selectors.companyDetail.name')
    const $founder = await this.crawlProperty($, 'selectors.companyDetail.founder')
    const $taxCode = await this.crawlProperty($, 'selectors.companyDetail.taxCode')
    const $address = await this.crawlProperty($, 'selectors.companyDetail.address')
    const $startDate = await this.crawlProperty($, 'selectors.companyDetail.startDate')
    return {
      phoneNumber: $phone?.first().text() || '',
      name: $name?.first().text(),
      founder: $founder?.first().text(),
      address: $address?.first().text(),
      taxCode: $taxCode?.first().text(),
      startDate: $startDate?.first().text()
    } as CompanyBaseDetail
  }
  combineLink(href?: string) {
    return `${this._urlExtractor.baseUrl}${href}`
  }
  abstract getCompanyLinks(html: string): string[] | Promise<string[]>
  abstract getCompanyDetail(html: string): CompanyBaseDetail | Promise<CompanyBaseDetail>
  abstract nextPage(): NextPage
}
