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
export const DriverConfigCompanyDetailSchema = z.object({
  name: z.string().optional(),
  founder: z.string().optional(),
  taxCode: z.string().optional(),
  phoneNumber: z.string(),
  address: z.string().optional(),
  startDate: z.string().optional()
})

export const DriverConfigSelectorSchema = z.object({
  companyLinks: z.string(),
  companyDetail: DriverConfigCompanyDetailSchema
})

export const DriverConfigRuleSchema = z.object({
  rules: z.array(z.string()),
  validateType: z.enum(['includes', 'startsWith', 'endsWith']),
  ignoreCase: z.boolean().optional()
})

export const DriverConfigBlackListSchema = z.record(
  DriverConfigCompanyDetailSchema.keyof(),
  DriverConfigRuleSchema.optional()
)

export const DriverConfigSchema = z.object({
  name: z.string(),
  baseUrl: z.string(),
  dateFormatInUse: z.string(),
  supportedExportFormat: z.array(z.string()),
  selectors: DriverConfigSelectorSchema,
  blackList: DriverConfigBlackListSchema.optional()
})
export type DriverConfig = z.infer<typeof DriverConfigSchema>
export type DriverConfigBlackList = z.infer<typeof DriverConfigBlackListSchema>
export type DriverConfigRule = z.infer<typeof DriverConfigRuleSchema>
export type DriverConfigSelector = z.infer<typeof DriverConfigSelectorSchema>
export type DriverConfigCompanyDetail = z.infer<typeof DriverConfigCompanyDetailSchema>
