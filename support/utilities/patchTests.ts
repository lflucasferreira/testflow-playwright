import { test, expect } from '../../fixtures'
import type { APIRequestContext } from '@playwright/test'
import type { JsonPatchOp } from './jsonPatch'
import { modifyPatchField } from './jsonPatch'
import { patchUserViaRules } from '../api/rulesClient'
import { pollGetUsersField } from './retry'
import { EXPECT, type ExpectStatus } from '../constants/httpStatus'
import { extractPatchValues } from './jsonPatch'

export interface PatchTestCase {
  label: string
  patches: JsonPatchOp[]
  userId?: number
  allowedStatuses?: ExpectStatus[]
  expectField?: string
}

export interface RunPatchTestsOptions {
  tag?: string | string[]
  defaultUserId?: number
  defaultAllowedStatuses?: ExpectStatus[]
}

const DEFAULT_ALLOWED: ExpectStatus[] = [
  EXPECT.happy,
  EXPECT.noContent,
  EXPECT.notFound,
  EXPECT.badRequest,
  EXPECT.validationError,
  EXPECT.methodNotAllowed,
]

const VALIDATION_FAILURE: ExpectStatus[] = [
  EXPECT.badRequest,
  EXPECT.notFound,
  EXPECT.validationError,
  EXPECT.serverError,
]

export function runPatchTests(
  suiteName: string,
  cases: PatchTestCase[],
  options: RunPatchTestsOptions = {},
): void {
  const tags = options.tag ? (Array.isArray(options.tag) ? options.tag : [options.tag]) : []
  const describeOptions = tags.length ? { tag: tags } : {}

  test.describe(suiteName, describeOptions, () => {
    for (const testCase of cases) {
      test(`${testCase.label} — PATCH via rules client`, async ({ request, authToken }) => {
        const userId = testCase.userId ?? options.defaultUserId ?? 1
        const allowed = testCase.allowedStatuses ?? options.defaultAllowedStatuses ?? DEFAULT_ALLOWED
        const response = await patchUserViaRules(request, authToken, userId, testCase.patches)
        expect(allowed).toContain(response.status())

        if (
          testCase.expectField &&
          (response.status() === EXPECT.happy || response.status() === EXPECT.noContent)
        ) {
          const expectedValues = extractPatchValues(testCase.patches)
          const expectedValue = expectedValues[testCase.expectField]
          if (expectedValue !== undefined) {
            const match = await pollGetUsersField(
              request,
              testCase.expectField,
              String(expectedValue),
              { headers: { Authorization: `Bearer ${authToken}` } },
            )
            expect(match[testCase.expectField]).toBe(expectedValue)
          }
        }
      })
    }
  })
}

export function runMandatoryFieldPatchTests(
  fieldPaths: string[],
  basePatch: JsonPatchOp[],
  options: RunPatchTestsOptions & { userId?: number } = {},
): void {
  const cases: PatchTestCase[] = fieldPaths.map((path) => ({
    label: `rejects null at ${path}`,
    patches: modifyPatchField(basePatch, path, null),
    userId: options.userId ?? options.defaultUserId ?? 1,
    allowedStatuses: VALIDATION_FAILURE,
  }))

  runPatchTests('Mandatory field validation — data-driven', cases, {
    ...options,
    tag: options.tag ?? ['@api', '@regression'],
  })
}

export async function executeSuccessfulPatchFlow(
  request: APIRequestContext,
  authToken: string,
  userId: number,
  patches: JsonPatchOp[],
  expectedField: string,
): Promise<void> {
  const expectedValues = extractPatchValues(patches)
  const response = await patchUserViaRules(request, authToken, userId, patches)

  if (response.status() === EXPECT.happy || response.status() === EXPECT.noContent) {
    const expectedValue = expectedValues[expectedField]
    if (expectedValue !== undefined) {
      const match = await pollGetUsersField(request, expectedField, String(expectedValue), {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      expect(match[expectedField]).toBe(expectedValue)
    }
    return
  }

  expect([EXPECT.notFound, EXPECT.badRequest, EXPECT.methodNotAllowed, EXPECT.validationError]).toContain(
    response.status(),
  )
}
