import exampleRoute from '@/routes/example'
import { router } from '@/utils/route'

const appRoute = router()

appRoute.use('example', exampleRoute)

export default appRoute
