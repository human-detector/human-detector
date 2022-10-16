export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class InvalidJwtError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'InvalidJwtError';
  }
}
