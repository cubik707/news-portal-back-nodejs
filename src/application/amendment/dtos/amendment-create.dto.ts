import { IsNotEmpty, IsString } from 'class-validator';

export class AmendmentCreateDto {
  @IsString()
  @IsNotEmpty()
  comment!: string;
}
