export class ErrorResponseDto {
  error: string;
  message: string;
  status: number;

  constructor(error: string, message: string, status: number) {
    this.error = error;
    this.message = message;
    this.status = status;
  }
}
