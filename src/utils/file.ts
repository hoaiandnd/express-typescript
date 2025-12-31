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
export const writeFile = async (data: string, ...joinPaths: string[]) => {
  const filePath = path.join(__dirname, '..', ...joinPaths)
  await fs.writeFile(filePath, data, 'utf-8')
}
export const log = async (message: string) => {
  return writeFile(message + '\n', 'log.txt')
}
