/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema } from '@typeschema/main';

export type HandlerFunction<TParams, TQuery, TBody> = (
  request: Request,
  context: { params: TParams; query: TQuery; body: TBody },
) => any;

export interface RouteHandlerBuilderConfig {
  paramsSchema: Schema;
  querySchema: Schema;
  bodySchema: Schema;
}

export type OriginalRouteHandler = (request: Request, context?: { params: Record<string, unknown> }) => any;
