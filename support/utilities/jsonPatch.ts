export type JsonPatchOp = {
  op: 'replace' | 'add' | 'remove'
  path: string
  value?: unknown
}

export class JsonPatchBuilder {
  private operations: JsonPatchOp[] = []

  replace(path: string, value: unknown) {
    this.operations.push({ op: 'replace', path, value })
    return this
  }

  add(path: string, value: unknown) {
    this.operations.push({ op: 'add', path, value })
    return this
  }

  remove(path: string) {
    this.operations.push({ op: 'remove', path })
    return this
  }

  build(): JsonPatchOp[] {
    return [...this.operations]
  }
}

export function createNamePatch(firstName: string, middleName: string, lastName: string): JsonPatchOp[] {
  return new JsonPatchBuilder()
    .replace('/name', firstName)
    .replace('/middleName', middleName)
    .replace('/lastName', lastName)
    .build()
}

export function extractPatchValues(patches: JsonPatchOp[]): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const { path, value } of patches) {
    const key = path.split('/').filter(Boolean).pop()
    if (key) values[key] = value
  }
  return values
}

export function modifyPatchField(patches: JsonPatchOp[], path: string, value: unknown): JsonPatchOp[] {
  return patches.map((op) => (op.path === path ? { ...op, value } : op))
}

export function removePatchField(patches: JsonPatchOp[], path: string): JsonPatchOp[] {
  return patches.filter((op) => op.path !== path)
}
