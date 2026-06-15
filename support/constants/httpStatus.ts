export const EXPECT = {
  happy: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  methodNotAllowed: 405,
  validationError: 422,
  serverError: 500,
} as const

export type ExpectStatus = (typeof EXPECT)[keyof typeof EXPECT]
