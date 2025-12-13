import express from 'express'
import dotenv from 'dotenv'
import appRoute from '@/routes'
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use('/', appRoute)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
