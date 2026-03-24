export class SuccessResponseDto<T> {
  data: T;
  message: string;
  status: number;

  constructor(data: T, message: string, status = 200) {
    this.data = data;
    this.message = message;
    this.status = status;
  }
}
