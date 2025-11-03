import type { ValidationFailure, ValidationSuccess } from "@/domain/narratives/schema";
import { BadRequestError } from "@/utils/errors";

export function unwrapValidation<T>(
  result: ValidationSuccess<T> | ValidationFailure,
  message = "Dados inválidos."
): T {
  if (!result.ok) {
    throw new BadRequestError(message, result.issues);
  }
  return result.data;
}
