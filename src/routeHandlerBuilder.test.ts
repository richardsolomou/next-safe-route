import { describe, expect, it } from 'vitest';
import * as yup from 'yup';
import { z } from 'zod';

import { HandlerFunction, createSafeRoute } from '.';

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  search: z.string().min(1),
});

const bodySchema = yup.object().shape({
  field: yup.string().required(),
});

describe('params validation', () => {
  const getHandler: HandlerFunction<{ id: string }, unknown, unknown> = async (request, context) => {
    const { id } = context.params;
    return Response.json({ id }, { status: 200 });
  };

  it('should validate and handle valid params', async () => {
    const GET = createSafeRoute().params(paramsSchema).handler(getHandler);

    const request = new Request('http://localhost/');
    const response = await GET(request, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ id: '550e8400-e29b-41d4-a716-446655440000' });
  });

  it('should return an error for invalid params', async () => {
    const GET = createSafeRoute().params(paramsSchema).handler(getHandler);

    const request = new Request('http://localhost/');
    const response = await GET(request, { params: { id: 'invalid-uuid' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid params');
  });
});

describe('query validation', () => {
  const getHandler: HandlerFunction<unknown, { search?: string }, unknown> = async (request, context) => {
    const { search } = context.query;
    return Response.json({ search }, { status: 200 });
  };

  it('should validate and handle valid query', async () => {
    const GET = createSafeRoute().query(querySchema).handler(getHandler);

    const request = new Request('http://localhost/?search=test');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ search: 'test' });
  });

  it('should return an error for invalid query', async () => {
    const GET = createSafeRoute().query(querySchema).handler(getHandler);

    const request = new Request('http://localhost/?search=');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid query');
  });
});

describe('body validation', () => {
  const getHandler: HandlerFunction<unknown, unknown, { field: string }> = async (request, context) => {
    const field = context.body.field;
    return Response.json({ field }, { status: 200 });
  };

  it('should validate and handle valid body', async () => {
    const POST = createSafeRoute().body(bodySchema).handler(getHandler);

    const request = new Request('http://localhost/', {
      method: 'POST',
      body: JSON.stringify({ field: 'test-field' }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ field: 'test-field' });
  });

  it('should return an error for invalid body', async () => {
    const POST = createSafeRoute().body(bodySchema).handler(getHandler);

    const request = new Request('http://localhost/', {
      method: 'POST',
      body: JSON.stringify({ field: 123 }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid body');
  });
});

describe('combined validation', () => {
  const getHandler: HandlerFunction<{ id: string }, { search?: string }, { field: string }> = async (
    request,
    context,
  ) => {
    const { id } = context.params;
    const { search } = context.query;
    const { field } = context.body;

    return Response.json({ id, search, field }, { status: 200 });
  };

  it('should validate and handle valid request with params, query, and body', async () => {
    const POST = createSafeRoute().params(paramsSchema).query(querySchema).body(bodySchema).handler(getHandler);

    const request = new Request('http://localhost/?search=test', {
      method: 'POST',
      body: JSON.stringify({ field: 'test-field' }),
    });

    const response = await POST(request, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      search: 'test',
      field: 'test-field',
    });
  });

  it('should return an error for invalid params in combined validation', async () => {
    const POST = createSafeRoute().params(paramsSchema).query(querySchema).body(bodySchema).handler(getHandler);

    const request = new Request('http://localhost/?search=test', {
      method: 'POST',
      body: JSON.stringify({ field: 'test-field' }),
    });

    const response = await POST(request, { params: { id: 'invalid-uuid' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid params');
  });

  it('should return an error for invalid query in combined validation', async () => {
    const POST = createSafeRoute().params(paramsSchema).query(querySchema).body(bodySchema).handler(getHandler);

    const request = new Request('http://localhost/?search=', {
      method: 'POST',
      body: JSON.stringify({ field: 'test-field' }),
    });

    const response = await POST(request, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid query');
  });

  it('should return an error for invalid body in combined validation', async () => {
    const POST = createSafeRoute().params(paramsSchema).query(querySchema).body(bodySchema).handler(getHandler);

    const request = new Request('http://localhost/?search=test', {
      method: 'POST',
      body: JSON.stringify({ field: 123 }),
    });

    const response = await POST(request, { params: { id: '550e8400-e29b-41d4-a716-446655440000' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid body');
  });
});
