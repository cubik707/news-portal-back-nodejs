import { BusinessException } from '../../../shared/exceptions/business.exception';

export class NewsApprovalNotFoundException extends BusinessException {
  constructor(id?: string) {
    super(id ? `News approval with id ${id} not found` : 'News approval not found', 404);
    this.name = 'NewsApprovalNotFoundException';
  }
}
