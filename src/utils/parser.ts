import z, { ZodError, ZodType } from 'zod'
import { readFile } from '@/utils/file'

export const readJsonWithSchema = async <T>(schema: ZodType<T>, ...path: string[]) => {
  try {
    const fileData = await readFile(...path)
    const raw = JSON.parse(fileData)
    return {
      isSuccess: true as const,
      data: schema.parse(raw)
    }
  } catch (err) {
    return {
      isSuccess: false as const,
      error: err instanceof ZodError ? z.treeifyError(err) : err
    }
  }
}
