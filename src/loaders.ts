// load supported domains
import { DriverBase } from '@/drivers/driver'
import { AppConfigSchema, CompanyRequestFiltersSchema } from '@/types'
import { CompanyRequestFilters } from '@/types/request'
import { readFile } from '@/utils/file'
import { parseJsonWithSchema, readJsonWithSchema } from '@/utils/parser'
import { UrlExtractor } from '@/utils/url'
import { Request } from 'express'
import fs from 'fs/promises'
import path from 'path'

async function isDomainSupported(url: string) {
  const urlExtractor = new UrlExtractor(url)
  const parseResult = await readJsonWithSchema(AppConfigSchema, 'configs.json')
  if (!parseResult.isSuccess) {
    console.error('Cannot read or parse from `configs.json`')
    return false
  }
  const { supportedDomains } = parseResult.data
  return supportedDomains.includes(urlExtractor.domain)
}
export async function supportedDomainsLoader(req: Request) {
  const parseResult = parseJsonWithSchema(CompanyRequestFiltersSchema, req.body)
  if (!parseResult.isSuccess) {
    console.error('Cannot parse request body for type `CompanyRequestFilters`')
    return null
  }
  const isSupported = await isDomainSupported(parseResult.data.url)
  return isSupported ? parseResult.data.url : null
}
export async function loadConfigs(key?: string) {
  const filePath = path.join(__dirname, 'configs.json')
  const read = await fs.readFile(filePath, 'utf-8')
  const json = JSON.parse(read)
  return key ? json[key] : json
}
export async function driverLoader(url: string) {
  const urlExtractor = new UrlExtractor(url)
  const parseResult = await readJsonWithSchema(AppConfigSchema, 'configs.json')
  if (!parseResult.isSuccess) {
    console.error('driverLoader_function: Cannot read or parse from `configs.json`')
    return null
  }
  const { supportedDomains } = parseResult.data
  const driverMap: Record<string, DriverBase> = {}
  supportedDomains.forEach(async domain => {
    driverMap[domain] = await import(`@/drivers/${domain}.ts`)
  })
}
