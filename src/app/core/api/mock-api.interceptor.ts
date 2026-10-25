import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { delay, of } from 'rxjs';
import { SignUpResponse } from './sign-up.models';

export interface MockApiConfig {
  readonly enabled: boolean;
  readonly delayMs: number;
}

interface MockApiWindow extends Window {
  __DISABLE_MOCK_API__?: boolean;
}

// This is to benifit Playwright tests where we can set a global flag to disable the mock API
function isMockApiEnabledByDefault(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  const win = window as MockApiWindow;
  if (win.__DISABLE_MOCK_API__ === true) {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return !params.has('disableMockApi');
}

export const MOCK_API_CONFIG = new InjectionToken<MockApiConfig>('MOCK_API_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    enabled: isMockApiEnabledByDefault(),
    delayMs: 600,
  }),
});

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(MOCK_API_CONFIG);

  if (!config.enabled || req.method !== 'POST' || !req.url.endsWith('/api/signup')) {
    return next(req);
  }

  const responseBody: SignUpResponse = {
    success: true,
    message: 'Thank you for signing up! You will receive our latest product updates shortly.',
  };

  return of(
    new HttpResponse<SignUpResponse>({
      status: 200,
      statusText: 'OK',
      body: responseBody,
    }),
  ).pipe(delay(config.delayMs));
};
