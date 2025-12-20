import {
  DriverConfigBlackListSchema,
  DriverConfigCompanyDetailSchema,
  DriverConfigRuleSchema,
  DriverConfigSchema,
  DriverConfigSelectorSchema
} from '@/types'
import z from 'zod'

export type NextPage = { nextPageIndex: number; nextPageUrl: string }
export type BlackListSpecifier = {
  list: string[]
  validateType: Pick<string, 'includes' | 'startsWith' | 'endsWith'>
  ignoreCase?: boolean
}
export type BlackListObject = {
  [_key in keyof CompanyBaseDetail]: BlackListSpecifier
}

export type DriverConfig = z.infer<typeof DriverConfigSchema>
export type DriverConfigBlackList = z.infer<typeof DriverConfigBlackListSchema>
export type DriverConfigRule = z.infer<typeof DriverConfigRuleSchema>
export type DriverConfigSelector = z.infer<typeof DriverConfigSelectorSchema>
export type DriverConfigCompanyDetail = z.infer<typeof DriverConfigCompanyDetailSchema>
