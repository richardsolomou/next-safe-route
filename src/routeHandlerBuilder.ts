import { Schema, validate } from '@typeschema/main';

import { HandlerFunction, OriginalRouteHandler, RouteHandlerBuilderConfig } from './types';

export class RouteHandlerBuilder {
  // The config object that will be used to store the schemas
  private config: RouteHandlerBuilderConfig = {};

  /**
   * Define the schema for the params
   * @param schema - The schema for the params
   * @returns The instance of the RouteHandlerBuilder
   */
  params(schema: Schema): this {
    this.config.paramsSchema = schema;
    return this;
  }

  /**
   * Define the schema for the query
   * @param schema - The schema for the query
   * @returns The instance of the RouteHandlerBuilder
   */
  query(schema: Schema): this {
    this.config.querySchema = schema;
    return this;
  }

  /**
   * Define the schema for the body
   * @param schema - The schema for the body
   * @returns The instance of the RouteHandlerBuilder
   */
  body(schema: Schema): this {
    this.config.bodySchema = schema;
    return this;
  }

  /**
   * Create the handler function that will be used by Next.js
   * @param handler - The handler function that will be called when the route is hit
   * @returns The original route handler that Next.js expects with the validation logic
   */
  handler<TParams, TQuery, TBody>(handler: HandlerFunction<TParams, TQuery, TBody>): OriginalRouteHandler {
    return async (request, context): Promise<Response> => {
      const url = new URL(request.url);
      const params = context?.params || {};
      const query = Object.fromEntries(url.searchParams.entries());
      const body = request.method !== 'GET' ? await request.json() : {};

      // Validate the params against the provided schema
      if (this.config.paramsSchema) {
        const paramsResult = await validate(this.config.paramsSchema, params);
        if (!paramsResult.success) {
          return Response.json({ message: 'Invalid params', errors: paramsResult.issues }, { status: 400 });
        }
      }

      // Validate the query against the provided schema
      if (this.config.querySchema) {
        const queryResult = await validate(this.config.querySchema, query);
        if (!queryResult.success) {
          return Response.json({ message: 'Invalid query', errors: queryResult.issues }, { status: 400 });
        }
      }

      // Validate the body against the provided schema
      if (this.config.bodySchema) {
        const bodyResult = await validate(this.config.bodySchema, body);
        if (!bodyResult.success) {
          return Response.json({ message: 'Invalid body', errors: bodyResult.issues }, { status: 400 });
        }
      }

      // Call the handler function with the validated params, query, and body
      return await handler(request, {
        params: params as TParams,
        query: query as TQuery,
        body: body as TBody,
      });
    };
  }
}
