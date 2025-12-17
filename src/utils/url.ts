export class UrlExtractor {
  protected _url: URL
  protected _originalUrl: string
  constructor(url: string) {
    if (!url.includes('http')) url = `http://${url}`
    this._url = new URL(url)
    this._originalUrl = url
  }
  get urlObj() {
    return this._url
  }
  get domain() {
    return this._url.hostname
  }
  get baseUrl() {
    return `${this._url.protocol}//${this._url.hostname.replace('https', '')}`
  }
  get url() {
    return this._url.toString()
  }
  get pathName() {
    return this._url.pathname
  }
  set pathName(path: string) {
    this._url.pathname = path
  }
  gotoNextPage(
    pageFinderGroupRegex: RegExp,
    pathNameReplaceCallback: (isMatch: boolean, nextPage: number) => string
  ): string {
    const { pathname } = this._url
    const [, page] = pathname.match(pageFinderGroupRegex) || []
    const nextPage = page ? +page + 1 : 2
    this._url.pathname = pathNameReplaceCallback(!!page, nextPage)
    return this._url.toString()
  }
}
