import { RouterOptions } from '@/types/common'
import express from 'express'

export const router = (routerOptions: RouterOptions) => {
  const expressRouter = express.Router()
  type ActionKeys = keyof typeof routerOptions.controller
  type Middleware = (_req: express.Request, _res: express.Response, _next: express.NextFunction) => void
  type OrderedMiddlewares = {
    before?: Middleware[]
    after?: Middleware[]
  }
  return {
    get: (path: string, actionKey: ActionKeys, middlewares?: OrderedMiddlewares) => {
      const action = routerOptions.controller[actionKey]
      if (typeof action !== 'function') {
        throw new Error(`Action ${actionKey} is not a function`)
      }
      const middlewaresBefore = middlewares?.before || []
      const middlewaresAfter = middlewares?.after || []

      expressRouter.get(
        path,
        ...middlewaresBefore,
        (req, res, next) => {
          const httpContext = {
            request: req,
            response: { ...res, ...(routerOptions.extendResponse ?? defaultExtendedResponse) },
            service: routerOptions.service
          }
          return action(httpContext)
        },
        ...middlewaresAfter
      )
    }
  }
}
