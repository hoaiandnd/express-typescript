import CongTyDoanhNghiepDriver from '@/drivers/congtydoanhnghiep.com'
import { DriverBase } from '@/drivers/driver'
import TraTenCongTyDriver from '@/drivers/www.tratencongty.com'
import { UrlExtractor } from '@/utils'

export class DriverFactory {
  protected _drivers: Map<string, DriverBase> = new Map()
  protected _urlExtractor: UrlExtractor
  constructor(url: string) {
    this._urlExtractor = new UrlExtractor(url)
    this.register()
  }
  protected register() {
    // register drivers here
    this._drivers.set('www.tratencongty.com', new TraTenCongTyDriver(this._urlExtractor))
    this._drivers.set('congtydoanhnghiep.com', new CongTyDoanhNghiepDriver(this._urlExtractor))
  }
  create() {
    const domain = this._urlExtractor.domain
    const driver = this._drivers.get(domain)
    return driver
  }
}
