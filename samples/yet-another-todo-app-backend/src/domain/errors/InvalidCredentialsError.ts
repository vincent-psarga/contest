export class InvalidCredentialsError extends Error {
  constructor(email: string) {
    super(`invalid credentials for user "${email}"`);
  }
}
