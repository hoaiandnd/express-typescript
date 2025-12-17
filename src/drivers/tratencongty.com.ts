import { BlackListObject, CompanyBaseDetail, DriverBase, NextPage } from '@/drivers/driver'
import { ClientDateTimeString } from '@/types/datetime'
import { CompanyFilters } from '@/types/request'
import { UrlExtractor } from '@/utils/url'
import * as cheerio from 'cheerio'
import { createWorker } from 'tesseract.js'

export default class TraTenCongTyDriver extends DriverBase {
  validateCompanyDetail(detail: CompanyBaseDetail, filter?: CompanyFilters): boolean | Promise<boolean> {
    // if (detail.phoneNumber.startsWith('02')) return false
    // else if (
    //   detail.name?.toLowerCase()?.includes('chi nhánh') ||
    //   detail.name?.toLowerCase()?.includes('văn phòng đại diện')
    // )
    //   return false
    return true
  }
  nextPage(): NextPage {
    const pageParam = this._urlExtractor.urlObj.searchParams.get('page') ?? '1'
    const currentPage = Math.max(parseInt(pageParam) || 1, 1)

    const nextPage = currentPage + 1

    // 👉 thay đổi TRỰC TIẾP trên url hiện tại
    this._urlExtractor.urlObj.searchParams.set('page', nextPage + '')

    // nếu muốn URL trang 1 KHÔNG có ?page=1
    if (nextPage === 1) {
      this._urlExtractor.urlObj.searchParams.delete('page')
    }
    const result = { nextPageUrl: this._urlExtractor.url, nextPageIndex: nextPage }
    console.log(result.nextPageUrl)
    return result
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
    // const { startDate } = companyDetail
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
  async isInBlackList(detail: CompanyBaseDetail) {
    const json = await this.getProperty('blackList')
    const blackList = JSON.parse(json) as BlackListObject
    for (const blackListKey in blackList) {
      // const currentList = blackList[blackListKey]
    }
    return true
  }
  protected async crawl($: cheerio.CheerioAPI) {
    const $phone = await this.crawlProperty($, 'selectors.companyDetail.phoneNumber')
    const $name = await this.crawlProperty($, 'selectors.companyDetail.name')
    let phoneNumber = ''
    const imageBase64 = $phone?.first()?.attr('src')
    const worker = await createWorker('eng')

    await worker.setParameters({
      tessedit_char_whitelist: '0123456789'
    })
    if (!imageBase64) {
      phoneNumber = ''
    } else {
      const numberConverted = await worker.recognize(imageBase64)
      phoneNumber = numberConverted.data.text
    }

    return {
      name: $name?.first().text(),
      founder: '',
      phoneNumber: phoneNumber,
      address: '',
      taxCode: '',
      startDate: ''
    } as CompanyBaseDetail
  }
}
