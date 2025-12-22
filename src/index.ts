import { Fetcher } from '@/fetcher'
import { driverLoader, supportedDomainsLoader } from '@/loaders'
import { CompanyRequestFilters } from '@/types'
import express from 'express'

const app = express()
const port = 3000
// built-in middleware
app.use(express.json())

app.post('/', async (req, res) => {
  // xac dinh bo nho
  // setInterval(() => {
  //   const used = process.memoryUsage()
  //   console.log(`RSS ${(used.rss / 1024 / 1024).toFixed(2)} MB`, `Heap ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`)
  // }, 5000)

  const urlExtractor = await supportedDomainsLoader(req)
  if (urlExtractor) {
    const filters = req.body as CompanyRequestFilters
    const driver = await driverLoader(filters.url)
    if (!driver) {
      res.status(400).json('Ten mien chua co driver nao dang ky. Hay dang ky trong configs.json')
      return
    }
    const companyDetails = await new Fetcher(driver).multiplePageFetch({
      requestFilters: filters,
      tranformFn: detail => ({
        name: detail?.name,
        phone: detail?.phoneNumber
      })
    })
    res.json(companyDetails)
  } else res.status(400).json('Ten mien chua co driver nao dang ky. Hay dang ky trong configs.json')
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
