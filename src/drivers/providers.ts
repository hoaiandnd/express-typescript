import { CompanyDetail, NextPage } from '@/types'
import { RegisteredDomain, RequestFilterOf } from '@/types/map'
import { MayBeAsync } from '@/types/redefined-types'

// khai báo các interface yêu cầu các driver phải implement
export interface IDriverValidator<TDomain extends RegisteredDomain> {
  validate(_detail: CompanyDetail, _filters?: RequestFilterOf<TDomain>): MayBeAsync<boolean>
}
export interface IDriverCrawler {
  getCompanyLinks(_html: string): MayBeAsync<string[]>
  getCompanyDetail(_html: string): MayBeAsync<CompanyDetail>
}
export interface IDriverPaginater {
  nextPage(): MayBeAsync<NextPage>
}
