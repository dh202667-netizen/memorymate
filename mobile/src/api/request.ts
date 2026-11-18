export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
export async function request<T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: unknown,
): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  if (!baseUrl || !/^https:\/\//.test(baseUrl)) throw new ApiError('请先配置 HTTPS 后端地址')
  return new Promise((resolve, reject) =>
    uni.request({
      url: baseUrl.replace(/\/$/, '') + path,
      method,
      data: data as UniApp.RequestOptions['data'],
      timeout: 15000,
      header: { 'Content-Type': 'application/json' },
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) resolve(response.data as T)
        else reject(new ApiError('服务暂时不可用，请稍后重试', response.statusCode))
      },
      fail() {
        reject(new ApiError('连接暂时中断，请检查网络后再试'))
      },
    }),
  )
}
