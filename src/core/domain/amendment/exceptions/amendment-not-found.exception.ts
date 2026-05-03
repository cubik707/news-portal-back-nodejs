import { BusinessException } from '../../../shared/exceptions/business.exception';

export class AmendmentNotFoundException extends BusinessException {
  constructor(id?: string) {
    super(id ? `Amendment with id ${id} not found` : 'Amendment not found', 404);
    this.name = 'AmendmentNotFoundException';
  }
}
