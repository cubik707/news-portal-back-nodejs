import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from '../../../core/shared/enums/approval-status.enum';

export class ProcessNewsApprovalDto {
  @IsEnum([ApprovalStatus.approved, ApprovalStatus.rejected])
  @IsNotEmpty()
  status!: ApprovalStatus.approved | ApprovalStatus.rejected;

  @IsString()
  @IsOptional()
  comment?: string;
}
