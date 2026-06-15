import { APIRequestContext, APIResponse } from '@playwright/test'
import { JsonPatchOp } from '../utilities/jsonPatch'
import { buildApiHeaders } from '../helpers/apiHeaders'

function authHeaders(token: string, extra: Record<string, string> = {}): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    ...buildApiHeaders(),
    ...extra,
  }
}

export async function patchUserViaRules(
  request: APIRequestContext,
  token: string,
  userId: number,
  patches: JsonPatchOp[] | Record<string, unknown>,
): Promise<APIResponse> {
  const isPatchArray = Array.isArray(patches)
  return request.patch(`/api/users/${userId}`, {
    headers: authHeaders(token, {
      'Content-Type': isPatchArray ? 'application/json-patch+json' : 'application/json',
    }),
    data: patches,
  })
}

export async function getUsersViaProfile(
  request: APIRequestContext,
  token: string,
): Promise<APIResponse> {
  return request.get('/api/users', { headers: authHeaders(token) })
}

export const SERVICE_CREDENTIALS = {
  client_id: process.env.SERVICE_CLIENT_ID ?? 'testflow-client',
  client_secret: process.env.SERVICE_CLIENT_SECRET ?? 'testflow-secret',
}
