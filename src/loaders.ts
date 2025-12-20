// load supported domains
import { AppConfigSchema } from '@/types'
import { CompanyFilters } from '@/types/request'
import { readFile } from '@/utils/file'
import { readJsonWithSchema } from '@/utils/parser'
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
  const body = req.body
  const filters = body as CompanyFilters
  const { url } = filters
  const isSupported = await isDomainSupported(url)
  if (isSupported) {
    return new UrlExtractor(url)
  } else {
    return null
  }
}
export async function loadConfigs(key?: string) {
  const filePath = path.join(__dirname, 'configs.json')
  const read = await fs.readFile(filePath, 'utf-8')
  const json = JSON.parse(read)
  return key ? json[key] : json
}
