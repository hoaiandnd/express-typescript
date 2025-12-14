import axios from 'axios'
import https from 'https'

export const crawler = axios.create({
  httpsAgent: new https.Agent({
    // Thiết lập tùy chọn quan trọng này: Bỏ qua việc kiểm tra tính hợp lệ của chứng chỉ SSL
    rejectUnauthorized: false
  })
})
