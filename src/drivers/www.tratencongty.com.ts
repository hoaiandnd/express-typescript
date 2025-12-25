import * as cheerio from 'cheerio'

import { DriverBase } from '@/drivers/driver'
import {
  ClientDateTimeString,
  CompanyDetail,
  CompanyRequestFilters,
  DriverConfigBlackList,
  DriverConfigSchema,
  NextPage
} from '@/types'
import { UrlExtractor } from '@/utils/url'
import { parseNumberFromImage, readJsonWithSchema } from '@/utils/parser'

export default class TraTenCongTyDriver extends DriverBase {
  async validate(detail: CompanyDetail, _filter?: CompanyRequestFilters) {
    if (!detail.phoneNumber) return false
    const isBlackListed = await this.isBlackListed(detail)
    console.log('Detail name: ', detail.name)
    if (isBlackListed) {
      console.error('In black list!!!')
      return false
    }
    const datetimeValidate = await this.datetimeValidate(detail, _filter?.from)
    return datetimeValidate
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
    return result
  }
  constructor(protected _urlExtractor: UrlExtractor) {
    super(_urlExtractor)
  }
  async datetimeValidate(_companyDetail: CompanyDetail, _fromDate?: ClientDateTimeString) {
    return true
  }
  async getCompanyDetail(html: string) {
    const $ = this.loadHtml(html)
    const crawlResult = await this.crawl($)
    return crawlResult
  }
  combineLink(href?: string) {
    return href ?? ''
  }
  async isBlackListed(detail: CompanyDetail) {
    const parseResult = await readJsonWithSchema(DriverConfigSchema, 'jsons', `${this._urlExtractor.domain}.json`)
    if (!parseResult.isSuccess) return false
    const { blackList } = parseResult.data
    if (!blackList) return false
    for (const [blackListKey, currentList] of Object.entries(blackList)) {
      const detailValue = detail[blackListKey as keyof DriverConfigBlackList]
      if (!detailValue) continue
      const isBlacklisted = currentList?.rules?.some(item => {
        const validateMethod = {
          includes: (s: string, v: string) =>
            currentList.ignoreCase ? s.toLowerCase().includes(v.toLowerCase()) : s.includes(v),
          startsWith: (s: string, v: string) =>
            currentList.ignoreCase ? s.toLowerCase().startsWith(v.toLowerCase()) : s.startsWith(v),
          endsWith: (s: string, v: string) =>
            currentList.ignoreCase ? s.toLowerCase().endsWith(v.toLowerCase()) : s.endsWith(v)
        }
        return validateMethod[currentList.validateType as keyof typeof validateMethod](detailValue, item)
      })
      if (isBlacklisted) return true
    }
    return false
  }
  // override base method
  protected async crawl($: cheerio.CheerioAPI) {
    const configs = await this.loadDriverConfigs()
    if (!configs?.isSuccess) return null
    const getNumber = async (selectorKey: keyof typeof configs.data.selectors.companyDetail) => {
      const $number = $(configs.data.selectors.companyDetail[selectorKey])
      const imageBase64 = $number?.first()?.attr('src')
      const number = await parseNumberFromImage(imageBase64)
      return number
    }

    const phoneNumber = await getNumber('phoneNumber')
    const taxCode = await getNumber('taxCode')
    const $name = $(configs.data.selectors.companyDetail.name)
    return {
      name: $name?.first().text(),
      founder: '',
      phoneNumber: phoneNumber.replace(/\r?\n|\r/g, ''),
      address: '',
      taxCode: taxCode.replace(/\r?\n|\r/g, ''),
      startDate: ''
    } as CompanyDetail
  }
}
