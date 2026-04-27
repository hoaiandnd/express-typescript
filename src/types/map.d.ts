import { CompanyRequestFilters } from '@/types/request'

export type RequestFilterTypeMap = {
  'www.tratencongty.com': {
    filters: CompanyRequestFilters
  }
  'congtydoanhnghiep.com': {
    filters: CompanyRequestFilters
  }
}

export type RegisteredDomain = keyof RequestFilterTypeMap
export type RequestFilterOf<TDomain extends RegisteredDomain> = RequestFilterTypeMap[TDomain]['filters']
