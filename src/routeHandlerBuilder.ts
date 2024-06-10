import { Infer, Schema, validate } from '@typeschema/main';

import { HandlerFunction, OriginalRouteHandler, RouteHandlerBuilderConfig } from './types';

export class RouteHandlerBuilder<
  TParams extends Schema = Schema,
  TQuery extends Schema = Schema,
  TBody extends Schema = Schema,
> {
  // The config object that will be used to store the schemas
  private config: RouteHandlerBuilderConfig = {
    paramsSchema: undefined as unknown as TParams,
    querySchema: undefined as unknown as TQuery,
    bodySchema: undefined as unknown as TBody,
  };

  /**
   * Define the schema for the params
   * @param schema - The schema for the params
   * @returns The instance of the RouteHandlerBuilder
   */
  params<T extends Schema>(schema: T): RouteHandlerBuilder<T, TQuery, TBody> {
    this.config.paramsSchema = schema;
    return this as unknown as RouteHandlerBuilder<T, TQuery, TBody>;
  }

  /**
   * Define the schema for the query
   * @param schema - The schema for the query
   * @returns The instance of the RouteHandlerBuilder
   */
  query<T extends Schema>(schema: T): RouteHandlerBuilder<TParams, T, TBody> {
    this.config.querySchema = schema;
    return this as unknown as RouteHandlerBuilder<TParams, T, TBody>;
  }

  /**
   * Define the schema for the body
   * @param schema - The schema for the body
   * @returns The instance of the RouteHandlerBuilder
   */
  body<T extends Schema>(schema: T): RouteHandlerBuilder<TParams, TQuery, T> {
    this.config.bodySchema = schema;
    return this as unknown as RouteHandlerBuilder<TParams, TQuery, T>;
  }

  /**
   * Create the handler function that will be used by Next.js
   * @param handler - The handler function that will be called when the route is hit
   * @returns The original route handler that Next.js expects with the validation logic
   */
  handler(handler: HandlerFunction<Infer<TParams>, Infer<TQuery>, Infer<TBody>>): OriginalRouteHandler {
    return async (request, context): Promise<Response> => {
      const url = new URL(request.url);
      const params = context?.params || {};
      const query = Object.fromEntries(url.searchParams.entries());
      const body = request.method !== 'GET' ? await request.json() : {};

      // Validate the params against the provided schema
      if (this.config.paramsSchema) {
        const paramsResult = await validate(this.config.paramsSchema, params);
        if (!paramsResult.success) {
          return new Response(JSON.stringify({ message: 'Invalid params', errors: paramsResult.issues }), {
            status: 400,
          });
        }
      }

      // Validate the query against the provided schema
      if (this.config.querySchema) {
        const queryResult = await validate(this.config.querySchema, query);
        if (!queryResult.success) {
          return new Response(JSON.stringify({ message: 'Invalid query', errors: queryResult.issues }), {
            status: 400,
          });
        }
      }

      // Validate the body against the provided schema
      if (this.config.bodySchema) {
        const bodyResult = await validate(this.config.bodySchema, body);
        if (!bodyResult.success) {
          return new Response(JSON.stringify({ message: 'Invalid body', errors: bodyResult.issues }), { status: 400 });
        }
      }

      // Call the handler function with the validated params, query, and body
      return await handler(request, {
        params: params as Infer<TParams>,
        query: query as Infer<TQuery>,
        body: body as Infer<TBody>,
      });
    };
  }
}
