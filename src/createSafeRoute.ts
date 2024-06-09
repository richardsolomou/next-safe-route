import { RouteHandlerBuilder } from './routeHandlerBuilder';

export function createSafeRoute(): RouteHandlerBuilder {
  return new RouteHandlerBuilder();
}
