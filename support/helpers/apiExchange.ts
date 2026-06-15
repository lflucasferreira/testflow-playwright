import { APIResponse, TestInfo } from '@playwright/test'

function maskHeaders(headers: Record<string, string>): Record<string, string> {
  const masked = { ...headers }
  if (masked.Authorization) masked.Authorization = 'Bearer ***'
  return masked
}

export function buildCurl(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: unknown,
): string {
  const headerFlags = Object.entries(headers)
    .map(([key, value]) => `-H '${key}: ${value}'`)
    .join(' ')
  const dataFlag = body !== undefined ? `-d '${JSON.stringify(body)}'` : ''
  return `curl -X ${method} '${url}' ${headerFlags} ${dataFlag}`.trim()
}

export async function attachHttpExchangeReport(
  testInfo: TestInfo,
  options: {
    label: string
    method: string
    url: string
    requestHeaders?: Record<string, string>
    requestBody?: unknown
    response: APIResponse
  },
): Promise<APIResponse> {
  const { label, method, url, requestHeaders, requestBody, response } = options
  const bodyText = await response.text()

  await testInfo.attach(`${label}-request`, {
    body: JSON.stringify({ method, url, headers: maskHeaders(requestHeaders ?? {}), body: requestBody }, null, 2),
    contentType: 'application/json',
  })

  await testInfo.attach(`${label}-response`, {
    body: JSON.stringify({ status: response.status(), headers: response.headers(), body: bodyText }, null, 2),
    contentType: 'application/json',
  })

  if (requestHeaders) {
    await testInfo.attach(`${label}-curl`, {
      body: buildCurl(method, url, maskHeaders(requestHeaders), requestBody),
      contentType: 'text/plain',
    })
  }

  return response
}
