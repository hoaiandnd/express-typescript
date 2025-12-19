import * as cheerio from 'cheerio'
import fs from 'fs/promises'
import path from 'path'

import { ClientDateTimeString } from '@/types/datetime'
import { CompanyFilters } from '@/types/request'
import { UrlExtractor } from '@/utils/url'

export type NextPage = { nextPageIndex: number; nextPageUrl: string }
export type BlackListSpecifier = {
  list: string[]
  validateType: Pick<string, 'includes' | 'startsWith' | 'endsWith'>
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
  validate(_detail: CompanyBaseDetail, _filter?: CompanyFilters): boolean | Promise<boolean>
  isBlackListed(_detail: CompanyBaseDetail): boolean | Promise<boolean>
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
  protected async crawl($: cheerio.CheerioAPI): Promise<CompanyBaseDetail> {
    const getText = async (key: string, fallback: string = '') => {
      const $el = await this.crawlProperty($, `selectors.companyDetail.${key}`)
      const text = $el?.first().text()
      return text ?? fallback
    }

    const [name, founder, phoneNumber, address, taxCode, startDate] = await Promise.all([
      getText('name'),
      getText('founder'),
      getText('phoneNumber'),
      getText('address'),
      getText('taxCode'),
      getText('startDate')
    ])

    return { name, founder, phoneNumber: phoneNumber ?? '', address, taxCode, startDate }
  }
  combineLink(href?: string) {
    return `${this._urlExtractor.baseUrl}${href}`
  }
  abstract getCompanyLinks(_html: string): string[] | Promise<string[]>
  abstract getCompanyDetail(_html: string): CompanyBaseDetail | Promise<CompanyBaseDetail>
  abstract nextPage(): NextPage
  abstract checkStartDate(_detail: CompanyBaseDetail, _fromDate?: ClientDateTimeString): boolean | Promise<boolean>
  abstract validate(_detail: CompanyBaseDetail, _filter?: CompanyFilters): boolean | Promise<boolean>
  abstract isBlackListed(_detail: CompanyBaseDetail): boolean | Promise<boolean>
}
