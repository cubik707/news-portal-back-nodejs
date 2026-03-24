export class BusinessException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'BusinessException';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
