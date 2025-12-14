import { ClientDateTimeString } from '@/types/datetime'

/**
 * Các tiêu chí được client gửi về để lọc dữ liệu công ty.
 * - Nếu không có `from` thì hệ thống sẽ sử dụng trang đầu tiên.
 * - Nếu không có `to` thì hệ thống sẽ cào dữ liệu đến khi đạt `limit`.
 * - Nếu không có `limit` thì hệ thống sẽ sử dụng giá trị mặc định từ biến môi trường `FETCH_LIMIT`.
 * @property `url` Đường dẫn trang web
 * @property `from` - optional - Thời gian bắt đầu lọc (tính theo giây)
 * @property `to` - optional - Thời gian kết thúc lọc (tính theo giây)
 * @property `limit` - optional - Số lượng bản ghi tối đa trả về
 */
export interface CompanyFilters {
  url: string
  from?: ClientDateTimeString
  to?: ClientDateTimeString
  limit?: number
}
