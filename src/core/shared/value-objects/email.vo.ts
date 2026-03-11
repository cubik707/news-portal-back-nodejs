import { BusinessException } from '../exceptions/business.exception';

export class Email {
  private readonly _value: string;

  constructor(email: string) {
    const trimmed = email.trim().toLowerCase();
    if (!Email.isValid(trimmed)) {
      throw new BusinessException(`Invalid email format: "${email}"`, 400);
    }
    this._value = trimmed;
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getValue(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
