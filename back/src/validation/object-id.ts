const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export function isObjectId(value: string): boolean {
  return OBJECT_ID_REGEX.test(value);
}