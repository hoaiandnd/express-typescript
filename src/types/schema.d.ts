import z from 'zod'

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

export const AppConfigSchema = z.object({
  supportedDomains: z.array(z.string()),
  concurrencyRequestLimit: z.number().nullish().optional(),
  maxPagesToCrawl: z.number()
})

export const CompanyRequestFiltersSchema = z.object({
  url: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().int().positive().optional()
})
