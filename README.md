<h1 align="center">next-safe-route</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/next-safe-route"><img src="https://img.shields.io/npm/v/next-safe-route?style=for-the-badge&logo=npm" /></a>
  <a href="https://github.com/richardsolomou/next-safe-route/actions/workflows/test.yaml"><img src="https://img.shields.io/github/actions/workflow/status/richardsolomou/next-safe-route/test.yaml?style=for-the-badge&logo=vitest" /></a>
  <a href="https://github.com/richardsolomou/next-safe-route/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/next-safe-route?style=for-the-badge" /></a>
</p>

`next-safe-route` is a utility library for Next.js that provides type-safety and schema validation for [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)/API Routes.

## Features

- **✅ Schema Validation:** Automatically validate request parameters, query strings, and body content with built-in error handling.
- **🧷 Type-Safe:** Work with full TypeScript type safety for parameters, query strings, and body content.
- **😌 Easy to Use:** Simple and intuitive API that makes defining route handlers a breeze.
- **🔗 Extensible:** Compatible with any validation library supported by [TypeSchema](https://typeschema.com).
- **🧪 Fully Tested:** Extensive test suite to ensure everything works reliably.

## Installation

```sh
npm install next-safe-route
```

The library natively works with [zod](https://zod.dev) for schema validation, but you can use any other validation library that is supported by [TypeSchema](https://typeschema.com), as long as you install its respective adapter.

## Usage

```ts
// app/api/hello/route.ts
import { createSafeRoute } from 'next-safe-route';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string(),
});

const querySchema = z.object({
  search: z.string().optional(),
});

const bodySchema = z.object({
  field: z.string(),
});

export const GET = createSafeRoute()
  .params(paramsSchema)
  .query(querySchema)
  .body(bodySchema)
  .handler((request, context) => {
    const { id } = context.params;
    const { search } = context.query;
    const { field } = context.body;

    return Response.json({ id, search, field }), { status: 200 };
  });
```

To define a route handler in Next.js:

1. Import `createSafeRoute` and your validation library (e.g., `zod`).
2. Define validation schemas for params, query, and body as needed.
3. Use `createSafeRoute()` to create a route handler, chaining `params`, `query`, and `body` methods.
4. Implement your handler function, accessing validated and type-safe params, query, and body through `context`.

## Tests

Tests are written using [Vitest](https://vitest.dev). To run the tests, use the following command:

```sh
pnpm test
```

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
