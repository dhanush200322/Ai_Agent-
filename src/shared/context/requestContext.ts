import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  requestId?: string;
  userId?: string;
  organizationId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getRequestContext = () => requestContext.getStore();
