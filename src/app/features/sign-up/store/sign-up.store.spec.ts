import { TestBed } from '@angular/core/testing';
import { SignUpApiService } from '@core/api/sign-up-api.service';
import { SignUpPayload, SignUpResponse } from '@core/api/sign-up.models';
import { Subject, throwError } from 'rxjs';
import { SignUpStore } from './sign-up.store';

describe('SignUpStore (Signal Forms & State Orchestration)', () => {
  let apiResponse$: Subject<SignUpResponse>;
  let submitSignUpSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    apiResponse$ = new Subject<SignUpResponse>();
    submitSignUpSpy = vi.fn(() => apiResponse$.asObservable());

    TestBed.configureTestingModule({
      providers: [
        SignUpStore,
        {
          provide: SignUpApiService,
          useValue: {
            submitSignUp: submitSignUpSpy,
          },
        },
      ],
    });
  });

  it('initializes in idle state with empty, untouchable invalid form fields', () => {
    const store = TestBed.inject(SignUpStore);

    expect(store.status()).toBe('idle');
    expect(store.isSubmitting()).toBe(false);
    expect(store.isSuccess()).toBe(false);
    expect(store.hasError()).toBe(false);
    expect(store.signUpForm().value()).toEqual({
      firstName: '',
      lastName: '',
      email: '',
    });
    expect(store.signUpForm().valid()).toBe(false);
    expect(store.signUpForm().touched()).toBe(false);
  });

  it('enforces trimmed name length (>= 2) and email domain TLD dot validation rules', () => {
    const store = TestBed.inject(SignUpStore);

    // Whitespace-only or 1-char trimmed names are invalid
    store.signUpForm.firstName().value.set('  A  ');
    store.signUpForm.lastName().value.set('   ');
    store.signUpForm.email().value.set('invalid@nodot');

    expect(store.signUpForm.firstName().invalid()).toBe(true);
    expect(store.signUpForm.firstName().errors()[0]?.message).toBe(
      'First name must be at least 2 characters.',
    );

    expect(store.signUpForm.lastName().invalid()).toBe(true);
    expect(store.signUpForm.lastName().errors()[0]?.message).toBe(
      'Last name is required.',
    );

    expect(store.signUpForm.email().invalid()).toBe(true);
    expect(store.signUpForm.email().errors()[0]?.message).toBe(
      'Please enter a valid email address.',
    );

    // Valid values pass schema validation
    store.signUpForm.firstName().value.set('Jane');
    store.signUpForm.lastName().value.set('Doe');
    store.signUpForm.email().value.set('jane.doe@example.com');

    expect(store.signUpForm().valid()).toBe(true);
  });

  it('marks fields as touched, focuses the first invalid field, and blocks API submission when invalid', () => {
    const store = TestBed.inject(SignUpStore);
    const focusSpy = vi.spyOn(store.signUpForm.firstName(), 'focusBoundControl');

    store.submitForm();

    expect(store.signUpForm.firstName().touched()).toBe(true);
    expect(store.signUpForm.lastName().touched()).toBe(true);
    expect(store.signUpForm.email().touched()).toBe(true);
    expect(focusSpy).toHaveBeenCalledOnce();
    expect(submitSignUpSpy).not.toHaveBeenCalled();
    expect(store.status()).toBe('idle');
  });

  it('submits trimmed payload, prevents double-submission while in-flight, and resets form on 200 OK', () => {
    const store = TestBed.inject(SignUpStore);

    store.signUpForm.firstName().value.set('  Jane  ');
    store.signUpForm.lastName().value.set('  Doe  ');
    store.signUpForm.email().value.set('Jane.Doe@example.com');

    store.submitForm();

    expect(store.status()).toBe('submitting');
    expect(store.isSubmitting()).toBe(true);
    expect(submitSignUpSpy).toHaveBeenCalledOnce();

    const expectedPayload: SignUpPayload = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'Jane.Doe@example.com',
    };
    expect(submitSignUpSpy).toHaveBeenCalledWith(expectedPayload);

    // Attempt a duplicate submission while in-flight -> ignored
    store.submitForm();
    expect(submitSignUpSpy).toHaveBeenCalledOnce();

    // Complete the API request
    apiResponse$.next({
      success: true,
      message: 'Welcome aboard!',
    });
    apiResponse$.complete();

    expect(store.status()).toBe('success');
    expect(store.isSuccess()).toBe(true);
    expect(store.submittedData()).toEqual(expectedPayload);
    expect(store.successMessage()).toBe('Welcome aboard!');

    // Verify the form was automatically cleared and reset
    expect(store.signUpForm().value()).toEqual({
      firstName: '',
      lastName: '',
      email: '',
    });
    expect(store.signUpForm().touched()).toBe(false);
  });

  it('transitions to error status with message when the API request fails', () => {
    submitSignUpSpy.mockReturnValueOnce(
      throwError(() => new Error('Service temporarily unavailable.')),
    );

    const store = TestBed.inject(SignUpStore);
    store.signUpForm.firstName().value.set('Jane');
    store.signUpForm.lastName().value.set('Doe');
    store.signUpForm.email().value.set('jane.doe@example.com');

    store.submitForm();

    expect(store.status()).toBe('error');
    expect(store.hasError()).toBe(true);
    expect(store.errorMessage()).toBe('Service temporarily unavailable.');
  });

  it('resets store state and form back to initial idle state when reset() is called', () => {
    const store = TestBed.inject(SignUpStore);
    store.signUpForm.firstName().value.set('Jane');
    store.signUpForm.lastName().value.set('Doe');
    store.signUpForm.email().value.set('jane.doe@example.com');

    store.submitForm();
    apiResponse$.next({ success: true, message: 'Success!' });
    apiResponse$.complete();

    expect(store.isSuccess()).toBe(true);

    store.reset();

    expect(store.status()).toBe('idle');
    expect(store.submittedData()).toBeNull();
    expect(store.successMessage()).toBeNull();
    expect(store.signUpForm().value()).toEqual({
      firstName: '',
      lastName: '',
      email: '',
    });
  });
});
