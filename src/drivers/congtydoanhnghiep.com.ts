import { BlackListObject, CompanyBaseDetail, DriverBase, NextPage } from '@/drivers/driver'
import { ClientDateTimeString } from '@/types/datetime'
import { CompanyFilters } from '@/types/request'
import { UrlExtractor } from '@/utils/url'
import * as cheerio from 'cheerio'

export class CongTyDoanhNghiepSelector {
  static Anchors: string = 'div.table-striped article h2 a'
  static PhoneNumber: string = 'div.table-striped div.table-responsive table:nth-child(4) tbody tr:nth-child(2) td'
  static Name: string = 'div.table-striped div.table-responsive table:nth-child(2) tbody tr:nth-child(1) td'
}

export default class CongTyDoanhNghiepDriver extends DriverBase {
  validate(detail: CompanyBaseDetail, filter?: CompanyFilters): boolean | Promise<boolean> {
    // if (detail.phoneNumber.startsWith('02')) return false
    // else if (
    //   detail.name?.toLowerCase()?.includes('chi nhánh') ||
    //   detail.name?.toLowerCase()?.includes('văn phòng đại diện')
    // )
    //   return false
    return true
  }
  nextPage(): NextPage {
    const { pathName } = this._urlExtractor
    const [, page] = pathName.match(/trang-(\d+)/) || []
    const nextPage = page ? +page + 1 : 2
    if (page) {
      this._urlExtractor.pathName = this._urlExtractor.pathName.replace(/trang-\d+/, `trang-${nextPage}`)
    } else {
      this._urlExtractor.pathName = pathName.replace(/\/([^\/]+)\.html$/, '/$1/trang-2')
    }
    return { nextPageUrl: this._urlExtractor.url, nextPageIndex: nextPage }
  }
  constructor(protected _urlExtractor: UrlExtractor) {
    super(_urlExtractor)
  }
  async getCompanyLinks(html: string) {
    const $ = this.loadHtml(html)
    const companyLinkSelectors = await this.getProperty('selectors.companyLinks')
    const anchors = $(companyLinkSelectors)
    const links = anchors.map((_, a) => this.combineLink($(a).attr('href')))
    return links.toArray()
  }
  async checkStartDate(companyDetail: CompanyBaseDetail, fromDate?: ClientDateTimeString) {
    if (!fromDate) return true
    const { startDate } = companyDetail
    return true
  }
  async getCompanyDetail(html: string) {
    const $ = this.loadHtml(html)
    const crawlResult = await this.crawl($)
    return crawlResult
  }
  combineLink(href?: string) {
    return `${this._urlExtractor.baseUrl}${href}`
  }
  async isBlackListed(detail: CompanyBaseDetail) {
    const json = await this.getProperty('blackList')
    const blackList = JSON.parse(json) as BlackListObject
    for (const blackListKey in blackList) {
      // const currentList = blackList[blackListKey]
    }
    return true
  }
}
