/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema } from './adapters/types';

export type HandlerFunction<TParams, TQuery, TBody, TContext> = (
  request: Request,
  context: { params: TParams; query: TQuery; body: TBody; data: TContext },
) => any;

export interface RouteHandlerBuilderConfig {
  paramsSchema: Schema;
  querySchema: Schema;
  bodySchema: Schema;
}

export type OriginalRouteHandler = (request: Request, context?: { params: Record<string, unknown> }) => any;

export type HandlerServerErrorFn = (error: Error) => Response;
