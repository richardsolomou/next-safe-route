# 🧷 next-safe-route</h1>

<p>
  <img src="https://img.shields.io/npm/v/next-safe-route" />
  <img src="https://img.shields.io/github/actions/workflow/status/richardsolomou/next-safe-route/release.yaml" />
  <img src="https://img.shields.io/npm/l/next-safe-route" />
</p>

`next-safe-route` is a utility library for [Next.js](https://nextjs.org) that provides a convenient way to define route handlers with type-safe validation for request parameters, query strings, and request bodies. It uses [TypeSchema](https://typeschema.com) to enable support for various validation libraries, such as [Zod](https://zod.dev) and [Yup](https://github.com/jquense/yup).

## Installation

To install `next-safe-route`, use the following command:

```sh
npm install next-safe-route
```

You will also need to install a validation library, such as `zod`.

```sh
npm install zod
```

## Usage

To define a route handler in Next.js, import and use the `createSafeRoute` function to create it.

You can then chain the `params`, `query`, and `body` methods to define the validation schema for the request parameters, query strings, and request body, respectively. Finally, use the `handler` method to define the route handler function.

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

## Tests

Tests are written using [Vitest](https://vitest.dev). To run the tests, use the following command:

```sh
pnpm test
```

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
