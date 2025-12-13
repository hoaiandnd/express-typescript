import { IActionService } from '@/types/common'

export class ExampleService implements IActionService {
  // ExampleService implementation
  // This service can contain methods that can be used in controllers
  exampleMethod() {
    // Example method logic
    return 'Example method called'
  }
}
