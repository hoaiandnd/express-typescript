import fs from 'fs/promises'
import path from 'path'

/**
 * @param joinPaths is configured to start from `src`
 */
export const readFile = async (...joinPaths: string[]) => {
  const filePath = path.join(__dirname, '..', ...joinPaths)
  const file = await fs.readFile(filePath, 'utf-8')
  return file
}
