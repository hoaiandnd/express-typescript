import z, { ZodError, ZodType } from 'zod'
import { readFile } from '@/utils/file'
import { createWorker } from 'tesseract.js'

export const readJsonWithSchema = async <T>(schema: ZodType<T>, ...path: string[]) => {
  const fileData = await readFile(...path)
  return parseJsonWithSchema(schema, fileData)
}

export const parseJsonWithSchema = <T>(schema: ZodType<T>, json?: string) => {
  try {
    const raw = JSON.parse(json || '')
    return { isSuccess: true as const, data: schema.parse(raw) }
  } catch (err) {
    return {
      isSuccess: false as const,
      error: err instanceof ZodError ? z.treeifyError(err) : err
    }
  }
}

export const parseNumberFromImage = async (imageUrl?: string, defaultValue: string = '') => {
  const worker = await createWorker('eng')
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789'
  })
  if (!imageUrl) {
    return defaultValue
  } else {
    const numberConverted = await worker.recognize(imageUrl)
    return numberConverted.data.text
  }
}
