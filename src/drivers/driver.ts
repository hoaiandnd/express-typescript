import { UrlExtractor } from '@/utils/url'
import path from 'path'
import fs from 'fs/promises'
import * as cheerio from 'cheerio'
import { ClientDateTimeString } from '@/types/datetime'
import { CompanyFilters } from '@/types/request'
export type NextPage = { nextPageIndex: number; nextPageUrl: string }
export type BlackListSpecifier = {
  list: string[]
  validateType: 'includes' | 'startWith' | 'endWith'
  ignoreCase?: boolean
}
export type BlackListObject = {
  [_key in keyof CompanyBaseDetail]: BlackListSpecifier
}
export interface IDriver {
  combineLink(): string
  getCompanyLinks(_html: string): string[] | Promise<string[]>
  getCompanyDetail(_html: string): CompanyBaseDetail | Promise<CompanyBaseDetail>
  nextPage(): NextPage
  checkStartDate(_detail: CompanyBaseDetail, _fromDate?: ClientDateTimeString): boolean | Promise<boolean>
  validateCompanyDetail(_detail: CompanyBaseDetail, _filter?: CompanyFilters): boolean | Promise<boolean>
  isInBlackList(_detail: CompanyBaseDetail): boolean | Promise<boolean>
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
  protected loadHtml(html: string, defaultValue: string = '', logHtml: boolean = true) {
    if (logHtml) console.log(typeof html === 'string')
    return cheerio.load(typeof html === 'string' ? html : defaultValue)
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
  protected async crawlProperty($: cheerio.CheerioAPI, selectorKey: string) {
    const selector = await this.getProperty(selectorKey)
    if (selector) return $(selector)
    else return undefined
  }
  protected async crawl($: cheerio.CheerioAPI) {
    const $phone = await this.crawlProperty($, 'selectors.companyDetail.phoneNumber')
    const $name = await this.crawlProperty($, 'selectors.companyDetail.name')
    // const $founder = await this.crawlProperty($, 'selectors.companyDetail.founder')
    // const $taxCode = await this.crawlProperty($, 'selectors.companyDetail.taxCode')
    // const $address = await this.crawlProperty($, 'selectors.companyDetail.address')
    // const $startDate = await this.crawlProperty($, 'selectors.companyDetail.startDate')
    return {
      name: $name?.first().text(),
      founder: '',
      phoneNumber: $phone?.first().text() || '',
      address: '',
      taxCode: '',
      startDate: ''
    } as CompanyBaseDetail
  }
  combineLink(href?: string) {
    return `${this._urlExtractor.baseUrl}${href}`
  }
  abstract getCompanyLinks(_html: string): string[] | Promise<string[]>
  abstract getCompanyDetail(_html: string): CompanyBaseDetail | Promise<CompanyBaseDetail>
  abstract nextPage(): NextPage
  abstract checkStartDate(_detail: CompanyBaseDetail, _fromDate?: ClientDateTimeString): boolean | Promise<boolean>
  abstract validateCompanyDetail(_detail: CompanyBaseDetail, _filter?: CompanyFilters): boolean | Promise<boolean>
  abstract isInBlackList(_detail: CompanyBaseDetail): boolean | Promise<boolean>
}
