export interface AuthorizationError {
  code:    number;
  status:  string;
  errors:  Error[];
  message: string;
}

export interface Error {
  status:  number;
  message: string;
  error:   string;
}
