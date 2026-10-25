import { ValidationError } from '@angular/forms/signals';

export function resolveFieldErrorMessage(
  errors: readonly ValidationError[],
  label = 'This field',
  customMessages?: Partial<Record<string, string>>,
): string | null {
  const firstError = errors[0];
  if (!firstError) {
    return null;
  }

  // 1. Explicit message defined directly on the Signal Forms validator rule
  if (firstError.message) {
    return firstError.message;
  }

  // 2. FieldConfig-level custom message override for this error kind
  const customMessage = customMessages?.[firstError.kind];
  if (customMessage) {
    return customMessage;
  }

  // 3. Shared Design System default fallbacks by error kind
  switch (firstError.kind) {
    case 'required':
      return `${label} is required.`;
    case 'email':
      return 'Please enter a valid email address.';
    case 'minLength': {
      const min =
        'minLength' in firstError && typeof firstError.minLength === 'number'
          ? firstError.minLength
          : undefined;
      return min !== undefined
        ? `${label} must be at least ${min} characters.`
        : `${label} is too short.`;
    }
    case 'maxLength': {
      const max =
        'maxLength' in firstError && typeof firstError.maxLength === 'number'
          ? firstError.maxLength
          : undefined;
      return max !== undefined
        ? `${label} must be no more than ${max} characters.`
        : `${label} is too long.`;
    }
    case 'pattern':
      return `${label} format is invalid.`;
    default:
      return `${label} is invalid.`;
  }
}
