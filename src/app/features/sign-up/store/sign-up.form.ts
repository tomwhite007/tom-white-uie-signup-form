import { signal } from '@angular/core';
import { FieldTree, form } from '@angular/forms/signals';
import { SignUpPayload } from '@core/api/sign-up.models';
import {
  FieldConfig,
  INITIAL_SIGN_UP_MODEL,
  SIGN_UP_FIELD_CONFIGS,
  SignUpFormModel,
  signUpValidationSchema,
} from './sign-up.schema';

export interface SignUpFormBundle {
  readonly signUpForm: FieldTree<SignUpFormModel>;
  readonly fields: readonly FieldConfig[];
  readonly resetForm: () => void;
  readonly focusFirstInvalidField: () => void;
  readonly getTrimmedPayload: () => SignUpPayload;
}

export function createSignUpForm(): SignUpFormBundle {
  const model = signal<SignUpFormModel>({ ...INITIAL_SIGN_UP_MODEL });
  const signUpForm = form(model, signUpValidationSchema);

  const resetForm = (): void => {
    signUpForm().reset({ ...INITIAL_SIGN_UP_MODEL });
  };

  const focusFirstInvalidField = (): void => {
    for (const fieldConfig of SIGN_UP_FIELD_CONFIGS) {
      const childField = signUpForm[fieldConfig.key]();
      if (childField.invalid()) {
        childField.focusBoundControl();
        return;
      }
    }
  };

  const getTrimmedPayload = (): SignUpPayload => {
    const current = signUpForm().value();
    return {
      firstName: current.firstName.trim(),
      lastName: current.lastName.trim(),
      email: current.email.trim(),
    };
  };

  return {
    signUpForm,
    fields: SIGN_UP_FIELD_CONFIGS,
    resetForm,
    focusFirstInvalidField,
    getTrimmedPayload,
  };
}
