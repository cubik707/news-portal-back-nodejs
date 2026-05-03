import { IsOptional, IsString } from 'class-validator';

export class AmendmentRejectDto {
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
