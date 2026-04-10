import { IsOptional, IsUUID } from 'class-validator';

export class SubmitNewsApprovalDto {
  @IsUUID()
  @IsOptional()
  adminId?: string;
}
