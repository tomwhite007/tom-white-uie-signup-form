import {
  SchemaPath,
  email,
  minLengthError,
  required,
  requiredError,
  schema,
  validate,
} from '@angular/forms/signals';

export interface SignUpFormModel {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
}

export type SignUpFieldKey = keyof SignUpFormModel;

export interface FieldConfig<K extends SignUpFieldKey = SignUpFieldKey> {
  readonly key: K;
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'email' | 'tel';
  readonly autocomplete: string;
  readonly placeholder: string;
  readonly required: boolean;
  readonly helperText?: string;
  readonly errorMessages?: Partial<Record<string, string>>;
}

export const INITIAL_SIGN_UP_MODEL: SignUpFormModel = {
  firstName: '',
  lastName: '',
  email: '',
};

export const SIGN_UP_FIELD_CONFIGS: readonly FieldConfig[] = [
  {
    key: 'firstName',
    id: 'sign-up-first-name',
    label: 'First name',
    type: 'text',
    autocomplete: 'given-name',
    placeholder: 'e.g. Jane',
    required: true,
  },
  {
    key: 'lastName',
    id: 'sign-up-last-name',
    label: 'Last name',
    type: 'text',
    autocomplete: 'family-name',
    placeholder: 'e.g. Doe',
    required: true,
  },
  {
    key: 'email',
    id: 'sign-up-email',
    label: 'Email address',
    type: 'email',
    autocomplete: 'email',
    placeholder: 'e.g. jane.doe@example.com',
    required: true,
    helperText: 'We will only use your email to share product updates.',
  },
];

function applyTrimmedNameRules(path: SchemaPath<string>, label: string): void {
  required(path, { message: `${label} is required.` });
  validate(path, ({ value }) => {
    const raw = value();
    if (!raw) {
      return undefined;
    }

    const trimmedLength = raw.trim().length;
    if (trimmedLength === 0) {
      return requiredError({ message: `${label} is required.` });
    }

    if (trimmedLength < 2) {
      return minLengthError(2, {
        message: `${label} must be at least 2 characters.`,
      });
    }

    return undefined;
  });
}

export const signUpValidationSchema = schema<SignUpFormModel>((path) => {
  applyTrimmedNameRules(path.firstName, 'First name');
  applyTrimmedNameRules(path.lastName, 'Last name');

  required(path.email, { message: 'Email address is required.' });
  validate(path.email, ({ value }) => {
    const raw = value();
    if (raw && raw.trim().length === 0) {
      return requiredError({ message: 'Email address is required.' });
    }
    return undefined;
  });
  email(path.email, { message: 'Please enter a valid email address.' });
});
