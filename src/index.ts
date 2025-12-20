import { supportedDomainsLoader } from '@/loaders'
import express from 'express'
import { Fetcher } from '@/fetcher'
import { CompanyRequestFilters } from '@/types/request'
import TraTenCongTyDriver from '@/drivers/www.tratencongty.com'

const app = express()
const port = 3000
// built-in middleware
app.use(express.json())

app.post('/', async (req, res) => {
  const urlExtractor = await supportedDomainsLoader(req)
  if (!!urlExtractor) {
    const filters = req.body as CompanyRequestFilters
    const fetcher = new Fetcher(new TraTenCongTyDriver(urlExtractor))
    const companyDetails = await fetcher.multiplePageFetch({
      requestFilters: filters,
      tranformFn: detail => ({
        name: detail?.name,
        phone: detail?.phoneNumber,
        taxCode: detail?.taxCode
      })
    })
    res.json(companyDetails)
  } else res.status(400).json('Ten mien chua co driver nao dang ky. Hay dang ky trong configs.json')
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
