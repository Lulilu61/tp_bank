import { HttpError } from '../errors/http-error.ts';

export type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Checks that the body is an object and contains only allowed fields
export function parseBody(body: unknown, allowedFields: readonly string[]): JsonObject {
  if (!isJsonObject(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }
  const unknownField = Object.keys(body).find((key) => !allowedFields.includes(key));
  if (unknownField !== undefined) {
    throw new HttpError(400, `Field "${unknownField}" is not allowed`);
  }
  return body;
}

export function requiredString(data: JsonObject, field: string): string {
  const value = data[field];
  if (value === undefined) {
    throw new HttpError(400, `${field} is required`);
  }
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} must be a string`);
  }
  return value;
}

export function optionalString(data: JsonObject, field: string): string | undefined {
  const value = data[field];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} must be a string`);
  }
  return value;
}