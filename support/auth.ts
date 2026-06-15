import { APIRequestContext, Page } from '@playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD } from './helpers'
import { readCachedAuthToken } from '../globalSetup'

interface AuthSession {
  email: string
  name: string
  token: string
}

async function fetchAuthToken(
  request: APIRequestContext,
  email = DEMO_EMAIL,
  password = DEMO_PASSWORD,
): Promise<AuthSession> {
  const response = await request.post('/api/auth/login', {
    data: { email, password },
  })
  const body = await response.json()
  return {
    email,
    name: body.user?.name ?? 'Demo User',
    token: body.token,
  }
}

async function injectAuth(page: Page, session: AuthSession): Promise<void> {
  await page.addInitScript((auth) => {
    sessionStorage.setItem('sandbox-auth', JSON.stringify(auth))
    sessionStorage.setItem('sandbox-token', auth.token)
  }, session)
}

export async function loginViaApi(
  page: Page,
  request: APIRequestContext,
  email = DEMO_EMAIL,
  password = DEMO_PASSWORD,
): Promise<void> {
  const session = await fetchAuthToken(request, email, password)
  await injectAuth(page, session)
  await page.goto('/web/dashboard.html')
  await page.getByTestId('page-dashboard').waitFor()
}

export async function visitAuthenticated(
  page: Page,
  request: APIRequestContext,
  path: string,
): Promise<void> {
  const session = await fetchAuthToken(request)
  await injectAuth(page, session)
  await page.goto(path)
}

export async function loginViaUi(
  page: Page,
  email = DEMO_EMAIL,
  password = DEMO_PASSWORD,
): Promise<void> {
  await page.goto('/web/login.html')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill(password)
  await page.getByTestId('login-submit').click()
  await page.getByTestId('page-dashboard').waitFor()
}

export async function authenticatedRequest(
  request: APIRequestContext,
  options: Parameters<APIRequestContext['fetch']>[1] & { url?: string } = {},
): Promise<ReturnType<APIRequestContext['fetch']>> {
  const loginRes = await request.post('/api/auth/login', {
    data: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  })
  const { token } = await loginRes.json()
  const { url, ...rest } = options as { url: string } & typeof options
  return request.fetch(url!, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(rest.headers ?? {}),
    },
  })
}

export async function getAuthToken(request: APIRequestContext): Promise<string> {
  const cached = readCachedAuthToken()
  if (cached) return cached
  const session = await fetchAuthToken(request)
  return session.token
}

export async function visitWithToken(
  page: Page,
  path: string,
  token: string,
  email = DEMO_EMAIL,
): Promise<void> {
  await page.addInitScript(
    ({ authEmail, authToken }) => {
      sessionStorage.setItem(
        'sandbox-auth',
        JSON.stringify({ email: authEmail, name: 'Demo User', token: authToken }),
      )
      sessionStorage.setItem('sandbox-token', authToken)
    },
    { authEmail: email, authToken: token },
  )
  await page.goto(path)
}
