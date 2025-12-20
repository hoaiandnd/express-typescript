import * as cheerio from 'cheerio'

import { ClientDateTimeString, CompanyDetail, CompanyRequestFilters, DriverConfigSchema, NextPage } from '@/types'
import { UrlExtractor, readJsonWithSchema } from '@/utils'

export interface IDriver {
  combineLink(): string
  getCompanyLinks(_html: string): string[] | Promise<string[]>
  getCompanyDetail(_html: string): (CompanyDetail | null) | Promise<CompanyDetail | null>
  nextPage(): NextPage
  datetimeValidate(_detail: CompanyDetail, _fromDate?: ClientDateTimeString): boolean | Promise<boolean>
  validate(_detail: CompanyDetail, _filter?: CompanyRequestFilters): boolean | Promise<boolean>
  isBlackListed(_detail: CompanyDetail): boolean | Promise<boolean>
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
  protected async loadDriverConfigs(driverConfigFilename?: string) {
    const fileName = driverConfigFilename ?? `${this._urlExtractor.domain}.json`
    const driverConfigs = await readJsonWithSchema(DriverConfigSchema, 'jsons', fileName)
    return driverConfigs
  }
  protected async crawl($: cheerio.CheerioAPI): Promise<CompanyDetail | null> {
    const driverLoader = await this.loadDriverConfigs()
    if (driverLoader?.isSuccess) {
      const { companyDetail: companyDetailSelectors } = driverLoader.data.selectors
      const getText = (key: keyof typeof companyDetailSelectors) => $(companyDetailSelectors[key]).first().text().trim()
      return {
        name: getText('name'),
        phoneNumber: getText('phoneNumber').replace('\n', ''),
        founder: getText('founder'),
        address: getText('address'),
        taxCode: getText('taxCode').replace('\n', ''),
        startDate: getText('startDate')
      }
    } else {
      // load driver json file failed
      return null
    }
  }
  combineLink(href?: string) {
    return `${this._urlExtractor.baseUrl}${href}`
  }
  async getCompanyLinks(html: string): Promise<string[]> {
    const $ = this.loadHtml(html)
    const configs = await this.loadDriverConfigs()
    if (!configs.isSuccess) return []
    const anchors = $(configs.data.selectors.companyLinks)
    const links = anchors.map((_, a) => this.combineLink($(a).attr('href')))
    return links.toArray()
  }
  abstract getCompanyDetail(_html: string): (CompanyDetail | null) | Promise<CompanyDetail | null>
  abstract nextPage(): NextPage
  abstract datetimeValidate(_detail: CompanyDetail, _fromDate?: ClientDateTimeString): boolean | Promise<boolean>
  abstract validate(_detail: CompanyDetail, _filter?: CompanyRequestFilters): boolean | Promise<boolean>
  abstract isBlackListed(_detail: CompanyDetail): boolean | Promise<boolean>
}

export { CompanyDetail, NextPage }
