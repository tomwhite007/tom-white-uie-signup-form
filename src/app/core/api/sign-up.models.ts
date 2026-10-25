export interface SignUpPayload {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly [key: string]: unknown;
}

export interface SignUpResponse {
  readonly success: boolean;
  readonly message: string;
}
