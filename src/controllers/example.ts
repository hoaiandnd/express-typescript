import { ExampleService } from '@/services/example'
import { IController, RouteHandler } from '@/types/common'

export class ExampleController implements IController {
  index: RouteHandler<ExampleService> = async ({ response, service }) => {
    response.ok({
      message: 'Hello from ExampleController',
      data: service.exampleMethod()
    })
  }
}
