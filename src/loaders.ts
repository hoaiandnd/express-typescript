// load supported domains
import { CompanyFilters } from '@/types/request'
import { UrlExtractor } from '@/utils/url'
import { NextFunction, Request, Response } from 'express'
import fs from 'fs/promises'
import path from 'path'

// DOMAIN LOADERS
async function getSupportedDomains() {
  const filePath = path.join(__dirname, 'configs.json')
  const read = await fs.readFile(filePath, 'utf-8')
  return read
}

async function isDomainSupported(url: string) {
  const urlExtractor = new UrlExtractor(url)
  const supportedDomains = await getSupportedDomains()
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
