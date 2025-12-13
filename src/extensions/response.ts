import { ApiResponse } from '@/types/common'
import { Response } from 'express'

export const registerResponse = (responseObj: Response) => {
  return {
    ok: <TData>(json?: ApiResponse<TData>) => {
      return responseObj.status(200).json({
        message: json?.message || 'OK',
        data: json?.data ?? null
      })
    }
  }
}
