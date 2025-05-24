import express from 'express'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.get('/', (_, res) => {
  res.send('Hello from TSX runtime!')
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
