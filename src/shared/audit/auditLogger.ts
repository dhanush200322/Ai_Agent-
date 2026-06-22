import logger from '../logger/logger';
import { getRequestContext } from '../context/requestContext';

export class AuditLogger {
  static log(action: string, resource: string, details: any = {}) {
    const context = getRequestContext();
    logger.info({
      audit: true,
      action,
      resource,
      userId: context?.userId,
      organizationId: context?.organizationId,
      requestId: context?.requestId,
      ...details,
    }, "Audit: " + action + " on " + resource);
  }
}
