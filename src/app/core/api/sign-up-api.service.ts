import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SignUpPayload, SignUpResponse } from './sign-up.models';

@Service()
export class SignUpApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/signup';

  submitSignUp(payload: SignUpPayload): Observable<SignUpResponse> {
    return this.http.post<SignUpResponse>(this.endpoint, payload);
  }
}
