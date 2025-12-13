import { Request, Response } from 'express'

export type TypeOf<T> = new (..._args: any[]) => T
/**
 * Các service dùng cho controller phải triển khai `IService`
 */
export interface IService {}
/**
 * Dùng đánh dấu là một controller class - không cần triển khai gì
 */
export interface IController {}
/**
 * Kiểu đánh dấu (marker) cho các service có thể được sử dụng trong controller - kiểu đơn
 */
export interface IActionService extends IService {}
/**
 * Kiểu đánh dấu (marker) cho các service có thể được sử dụng trong controller - nhận nhiều service
 */
export interface IMultipleActionServices {
  [serviceKey: string]: IActionService
}
/**
 * Kiểu tham số cho các route handler (không sử dụng service) trong controller - và dùng trong các router
 */
export type HttpContextWithoutService<IRequest extends Request = Request, IResponse extends Response = Response> = {
  request: IRequest
  response: IResponse
}
/**
 * Kiểu tham số cho các route handler (có sử dụng service) trong controller - và dùng trong các router
 */
export type HttpContext<
  TService extends IActionService | IMultipleActionServices,
  IRequest extends Request = Request,
  IResponse extends Response = ExtendedResponse
> = HttpContextWithoutService<IRequest, IResponse> & {
  service: TService
}
/**
 * Kiểu trả về của route handler trong controller
 * - có thể là `Promise<void>` hoặc `void`
 */
export type RouteHandlerReturnType = Promise<void> | void
/**
 * Kiểu hàm xử lý route không sử dụng service trong controller
 */
export type RouteHandlerWithoutService = (_httpContext: HttpContextWithoutService) => RouteHandlerReturnType
/**
 * Kiểu hàm xử lý route có sử dụng service trong controller
 */
export type RouteHandler<TService extends IActionService | IMultipleActionServices> = (
  _httpContext: HttpContext<TService>
) => RouteHandlerReturnType
/**
 * Kiểu trả về của route handler trong controller
 */
export type ApiResponse<TData = any> = {
  message?: string
  data?: TData
}
/**
 * Kiểu mở rộng của Response để hỗ trợ các phương thức trả về khác nhau
 */
export type ExtendedResponseMethod = <TData = any>(_json?: ApiResponse<TData>) => ExtendedResponse

export type ExtendedResponseObject = {
  ok: ExtendedResponseMethod
  created: ExtendedResponseMethod
  noContent: ExtendedResponseMethod
  badRequest: ExtendedResponseMethod
  unauthorized: ExtendedResponseMethod
  forbidden: ExtendedResponseMethod
  notFound: ExtendedResponseMethod
  internalServerError: ExtendedResponseMethod
}
/**
 * Mở rộng kiểu Response của Express để thêm các phương thức trả về JSON với các mã trạng thái HTTP khác nhau
 */
export type ExtendedResponse = Response & ExtendedResponseObject
export interface RouteRegisteredController extends IController {
  [actionKey: string]: RouteHandler<IActionService | IMultipleActionServices> | RouteHandlerWithoutService
}
export type RouterOptions = {
  controller: RouteRegisteredController
  service?: IActionService | IMultipleActionServices
  extendResponse?: ExtendedResponseObject
}
