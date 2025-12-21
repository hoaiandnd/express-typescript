import fs from 'fs'
import path from 'path'
import { stringify } from 'csv-stringify/sync'

export function appendToCSV<T extends Record<string, unknown>>(filePath: string, records: T[]): void {
  if (records.length === 0) return

  fs.mkdirSync(path.dirname(filePath), { recursive: true })

  const fileExists = fs.existsSync(filePath)

  const csv = stringify(records, {
    header: !fileExists,
    quoted: true // an toàn cho dấu phẩy, xuống dòng
  })
  if (!fileExists) {
    fs.writeFileSync(filePath, '\uFEFF')
  }
  fs.appendFileSync(filePath, csv, { encoding: 'utf8' })
}
