import { CompanyBaseDetail, DriverBase, NextPage } from '@/drivers/driver'
import { UrlExtractor } from '@/utils/url'
import * as cheerio from 'cheerio'

export class CongTyDoanhNghiepSelector {
  static Anchors: string = 'div.table-striped article h2 a'
  static PhoneNumber: string = 'div.table-striped div.table-responsive table:nth-child(4) tbody tr:nth-child(2) td'
  static Name: string = 'div.table-striped div.table-responsive table:nth-child(2) tbody tr:nth-child(1) td'
}

export default class CongTyDoanhNghiepDriver extends DriverBase {
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
    const $ = cheerio.load(html)
    const companyLinkSelectors = await this.getProperty('selectors.companyLinks')
    const anchors = $(companyLinkSelectors)
    const links = anchors.map((_, a) => this.combineLink($(a).attr('href')))
    return links.toArray()
  }
  async getCompanyDetail(html: string) {
    const $ = cheerio.load(html)
    const crawlResult = await this.crawl($)
    return crawlResult
  }
  combineLink(href?: string) {
    return `${this._urlExtractor.baseUrl}${href}`
  }
}
