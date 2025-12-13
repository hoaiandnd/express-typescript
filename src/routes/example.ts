import { ExampleController } from '@/controllers/example'
import { ExampleService } from '@/services/example'
import { router } from '@/utils/route'

const exampleRoute = router({ 
  controller: new ExampleController(),
  service: new ExampleService()
})

exampleRoute.get('/')

export default exampleRoute
