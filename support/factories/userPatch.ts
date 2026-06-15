import { createNamePatch, JsonPatchBuilder } from '../utilities/jsonPatch'

export class UserPatchFactory {
  static createNamePatch(firstName: string, middleName: string, lastName: string) {
    return createNamePatch(firstName, middleName, lastName)
  }

  static createSimpleNamePatch(name: string) {
    return new JsonPatchBuilder().replace('/name', name).build()
  }
}
