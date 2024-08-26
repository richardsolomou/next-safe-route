import { RouteHandlerBuilder } from './routeHandlerBuilder';
import { HandlerServerErrorFn } from './types';

export function createSafeRoute(params?: { handleServerError?: HandlerServerErrorFn }) {
  return new RouteHandlerBuilder({
    handleServerError: params?.handleServerError,
    contextType: {},
  });
}
