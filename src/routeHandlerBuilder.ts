import { Infer, Schema, ValidationAdapter } from './adapters/types';
import { zodAdapter } from './adapters/zod';
import { HandlerFunction, HandlerServerErrorFn, OriginalRouteHandler } from './types';

type Middleware<T = Record<string, unknown>> = (request: Request) => Promise<T>;

export class RouteHandlerBuilder<
  TParams extends Schema = Schema,
  TQuery extends Schema = Schema,
  TBody extends Schema = Schema,
  TContext extends Record<string, unknown> = Record<string, unknown>,
> {
  private config: {
    paramsSchema?: TParams;
    querySchema?: TQuery;
    bodySchema?: TBody;
  };
  private middlewares: Middleware[];
  private handleServerError?: HandlerServerErrorFn;
  private validationAdapter: ValidationAdapter;
  private contextType: TContext;

  constructor({
    config = {},
    validationAdapter = zodAdapter(),
    middlewares = [],
    handleServerError,
    contextType,
  }: {
    config?: {
      paramsSchema?: TParams;
      querySchema?: TQuery;
      bodySchema?: TBody;
    };
    middlewares?: Middleware[];
    handleServerError?: HandlerServerErrorFn;
    validationAdapter?: ValidationAdapter;
    contextType: TContext;
  }) {
    this.config = config;
    this.middlewares = middlewares;
    this.handleServerError = handleServerError;
    this.validationAdapter = validationAdapter;
    this.contextType = contextType;
  }

  /**
   * Define the schema for the params
   * @param schema - The schema for the params
   * @returns A new instance of the RouteHandlerBuilder
   */
  params<T extends Schema>(schema: T): RouteHandlerBuilder<T, TQuery, TBody, TContext> {
    return new RouteHandlerBuilder<T, TQuery, TBody, TContext>({
      ...this,
      config: { ...this.config, paramsSchema: schema },
    });
  }

  /**
   * Define the schema for the query
   * @param schema - The schema for the query
   * @returns A new instance of the RouteHandlerBuilder
   */
  query<T extends Schema>(schema: T): RouteHandlerBuilder<TParams, T, TBody, TContext> {
    return new RouteHandlerBuilder<TParams, T, TBody, TContext>({
      ...this,
      config: { ...this.config, querySchema: schema },
    });
  }

  /**
   * Define the schema for the body
   * @param schema - The schema for the body
   * @returns A new instance of the RouteHandlerBuilder
   */
  body<T extends Schema>(schema: T): RouteHandlerBuilder<TParams, TQuery, T, TContext> {
    return new RouteHandlerBuilder<TParams, TQuery, T, TContext>({
      ...this,
      config: { ...this.config, bodySchema: schema },
    });
  }

  /**
   * Add a middleware to the route handler
   * @param middleware - The middleware function to be executed
   * @returns A new instance of the RouteHandlerBuilder
   */
  use<TReturnType extends Record<string, unknown>>(middleware: Middleware<TReturnType>) {
    return new RouteHandlerBuilder({
      ...this,
      middlewares: [...this.middlewares, middleware],
      contextType: {} as unknown as TContext & TReturnType,
    });
  }

  /**
   * Create the handler function that will be used by Next.js
   * @param handler - The handler function that will be called when the route is hit
   * @returns The original route handler that Next.js expects with the validation logic
   */
  handler(handler: HandlerFunction<Infer<TParams>, Infer<TQuery>, Infer<TBody>, TContext>): OriginalRouteHandler {
    return async (request, context): Promise<Response> => {
      try {
        const url = new URL(request.url);
        let params = context?.params || {};
        let query = Object.fromEntries(url.searchParams.entries());
        let body = request.method !== 'GET' ? await request.json() : {};

        // Validate the params against the provided schema
        if (this.config.paramsSchema) {
          const paramsResult = await this.validationAdapter.validate(this.config.paramsSchema, params);
          if (!paramsResult.success) {
            throw new Error(JSON.stringify({ message: 'Invalid params', errors: paramsResult }));
          }
          params = paramsResult.data;
        }

        // Validate the query against the provided schema
        if (this.config.querySchema) {
          const queryResult = await this.validationAdapter.validate(this.config.querySchema, query);
          if (!queryResult.success) {
            throw new Error(JSON.stringify({ message: 'Invalid query', errors: queryResult.issues }));
          }
          query = queryResult.data;
        }

        // Validate the body against the provided schema
        if (this.config.bodySchema) {
          const bodyResult = await this.validationAdapter.validate(this.config.bodySchema, body);
          if (!bodyResult.success) {
            throw new Error(JSON.stringify({ message: 'Invalid body', errors: bodyResult.issues }));
          }
          body = bodyResult.data;
        }

        // Execute middlewares and build context
        let middlewareContext: TContext = {} as TContext;
        for (const middleware of this.middlewares) {
          const result = await middleware(request);
          middlewareContext = { ...middlewareContext, ...result };
        }

        // Call the handler function with the validated params, query, and body
        const result = await handler(request, {
          params: params as Infer<TParams>,
          query: query as Infer<TQuery>,
          body: body as Infer<TBody>,
          data: middlewareContext,
        });
        return result;
      } catch (error) {
        if (this.handleServerError) {
          return this.handleServerError(error as Error);
        }

        if (error instanceof Error) {
          return new Response(error.message, { status: 400 });
        }

        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
      }
    };
  }
}
