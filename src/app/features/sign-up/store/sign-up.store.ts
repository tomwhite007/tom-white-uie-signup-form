import { computed, inject } from '@angular/core';
import { SignUpApiService } from '@core/api/sign-up-api.service';
import { SignUpPayload } from '@core/api/sign-up.models';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, of, pipe, tap } from 'rxjs';
import { createSignUpForm } from './sign-up.form';

export type SignUpSubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface SignUpState {
  readonly status: SignUpSubmissionStatus;
  readonly errorMessage: string | null;
  readonly submittedData: SignUpPayload | null;
  readonly successMessage: string | null;
}

const initialState: SignUpState = {
  status: 'idle',
  errorMessage: null,
  submittedData: null,
  successMessage: null,
};

export const SignUpStore = signalStore(
  withState(initialState),
  withProps(() => ({
    _api: inject(SignUpApiService),
    ...createSignUpForm(),
  })),
  withComputed(({ status }) => ({
    isSubmitting: computed(() => status() === 'submitting'),
    isSuccess: computed(() => status() === 'success'),
    hasError: computed(() => status() === 'error'),
  })),
  withMethods((store) => {
    const submit = rxMethod<SignUpPayload>(
      pipe(
        tap(() =>
          patchState(store, {
            status: 'submitting',
            errorMessage: null,
          }),
        ),
        exhaustMap((payload) =>
          store._api.submitSignUp(payload).pipe(
            tap((response) => {
              store.resetForm();
              patchState(store, {
                status: 'success',
                submittedData: payload,
                successMessage: response.message,
                errorMessage: null,
              });
            }),
            catchError((error: unknown) => {
              const message =
                error instanceof Error && error.message
                  ? error.message
                  : 'We were unable to complete your sign-up. Please try again.';
              patchState(store, {
                status: 'error',
                errorMessage: message,
              });
              return of(null);
            }),
          ),
        ),
      ),
    );

    return {
      submitForm(): void {
        if (store.isSubmitting()) {
          return;
        }

        store.signUpForm().markAsTouched();

        if (!store.signUpForm().valid()) {
          store.focusFirstInvalidField();
          return;
        }

        submit(store.getTrimmedPayload());
      },
      reset(): void {
        store.resetForm();
        patchState(store, initialState);
      },
    };
  }),
);
