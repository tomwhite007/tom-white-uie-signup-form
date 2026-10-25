import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MOCK_API_CONFIG, mockApiInterceptor } from './mock-api.interceptor';
import { SignUpPayload, SignUpResponse } from './sign-up.models';

describe('mockApiInterceptor', () => {
  const payload: SignUpPayload = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
  };

  it('intercepts POST /api/signup and returns a simulated 200 OK response when enabled', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
        {
          provide: MOCK_API_CONFIG,
          useValue: { enabled: true, delayMs: 0 },
        },
      ],
    });

    const http = TestBed.inject(HttpClient);
    const httpTesting = TestBed.inject(HttpTestingController);

    const response = await firstValueFrom(
      http.post<SignUpResponse>('/api/signup', payload),
    );

    expect(response).toEqual({
      success: true,
      message:
        'Thank you for signing up! You will receive our latest product updates shortly.',
    });
    httpTesting.expectNone('/api/signup');
  });

  it('passes POST /api/signup through to the network when MOCK_API_CONFIG.enabled is false', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
        {
          provide: MOCK_API_CONFIG,
          useValue: { enabled: false, delayMs: 0 },
        },
      ],
    });

    const http = TestBed.inject(HttpClient);
    const httpTesting = TestBed.inject(HttpTestingController);

    let actualResponse: SignUpResponse | undefined;
    http.post<SignUpResponse>('/api/signup', payload).subscribe((res) => {
      actualResponse = res;
    });

    const req = httpTesting.expectOne('/api/signup');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: 'From backend' });

    expect(actualResponse).toEqual({ success: true, message: 'From backend' });
    httpTesting.verify();
  });
});
