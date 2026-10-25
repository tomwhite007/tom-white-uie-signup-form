import {
  emailError,
  maxLengthError,
  minLengthError,
  patternError,
  requiredError,
  ValidationError,
} from '@angular/forms/signals';
import { resolveFieldErrorMessage } from './form-error.util';

describe('resolveFieldErrorMessage', () => {
  it('returns null when errors array is empty', () => {
    expect(resolveFieldErrorMessage([], 'First name')).toBeNull();
  });

  it('prioritizes explicit message on the ValidationError (Tier 1)', () => {
    const error = requiredError({ message: 'Explicit validator message.' });
    expect(
      resolveFieldErrorMessage([error], 'First name', {
        required: 'Custom config override.',
      }),
    ).toBe('Explicit validator message.');
  });

  it('falls back to FieldConfig customMessages override when validator has no explicit message (Tier 2)', () => {
    const error = requiredError();
    expect(
      resolveFieldErrorMessage([error], 'First name', {
        required: 'Please provide your given name.',
      }),
    ).toBe('Please provide your given name.');
  });

  it('falls back to shared Design System defaults by error kind (Tier 3)', () => {
    expect(resolveFieldErrorMessage([requiredError()], 'First name')).toBe(
      'First name is required.',
    );

    expect(resolveFieldErrorMessage([emailError()], 'Email address')).toBe(
      'Please enter a valid email address.',
    );

    expect(resolveFieldErrorMessage([minLengthError(2)], 'Last name')).toBe(
      'Last name must be at least 2 characters.',
    );

    expect(resolveFieldErrorMessage([maxLengthError(50)], 'Last name')).toBe(
      'Last name must be no more than 50 characters.',
    );

    expect(resolveFieldErrorMessage([patternError(/^[a-z]+$/)], 'Code')).toBe(
      'Code format is invalid.',
    );

    const customErr: ValidationError = { kind: 'customKind' };
    expect(resolveFieldErrorMessage([customErr], 'Field')).toBe(
      'Field is invalid.',
    );
  });
});
