import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SignUpApiService } from './sign-up-api.service';
import { SignUpPayload, SignUpResponse } from './sign-up.models';

describe('SignUpApiService', () => {
  let service: SignUpApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SignUpApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('sends a POST request to /api/signup with the sign-up payload', () => {
    const payload: SignUpPayload = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
    };

    const mockResponse: SignUpResponse = {
      success: true,
      message: 'Signed up!',
    };

    let actualResponse: SignUpResponse | undefined;
    service.submitSignUp(payload).subscribe((res) => {
      actualResponse = res;
    });

    const req = httpTesting.expectOne('/api/signup');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush(mockResponse);
    expect(actualResponse).toEqual(mockResponse);
  });
});
