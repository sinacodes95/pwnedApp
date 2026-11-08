import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { ApiError } from './api-error.ts';
import { createHibpClient } from './hibp.ts';

const EMAIL_PATTERN = /^[^\s@\p{Cc}\p{Cs}]+@[^\s@\p{Cc}\p{Cs}]+\.[^\s@\p{Cc}\p{Cs}]+$/u;
const PREFIX_PATTERN = /^[0-9a-f]{5}$/i;
const SPA_PATHS = ['/', '/email', '/password', '/pwnedapp'];
const STATIC_CSP = "default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'";

interface AppOptions {
  hibp?: ReturnType<typeof createHibpClient>;
  staticRoot?: string;
}

const respondToError: ErrorRequestHandler = (error: unknown, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  let apiError = new ApiError(500, 'INTERNAL_ERROR', 'The check could not be completed. Please try again.');
  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof URIError) {
    apiError = new ApiError(400, 'INVALID_REQUEST', 'The request URL is invalid.');
  } else if (error instanceof Error && 'status' in error) {
    switch (error.status) {
      case 400:
        apiError = new ApiError(400, 'INVALID_REQUEST', 'Send a valid JSON request body.');
        break;
      case 403:
        apiError = new ApiError(403, 'FORBIDDEN', 'Access to this resource is forbidden.');
        break;
      case 404:
        apiError = new ApiError(404, 'NOT_FOUND', 'This resource was not found.');
        break;
      case 413:
        apiError = new ApiError(413, 'PAYLOAD_TOO_LARGE', 'The request body is too large.');
        break;
      case 415:
        apiError = new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Send an uncompressed application/json request.');
        break;
    }
  }

  if (apiError.retryAfter) response.set('Retry-After', apiError.retryAfter);
  response.status(apiError.status).json({ error: { code: apiError.code, message: apiError.message } });
};

export function createApp({ hibp = createHibpClient(), staticRoot }: AppOptions = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((_request, response, next) => {
    response.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    next();
  });

  const api = express.Router();
  api.use((_request, response, next) => {
    response.set('Cache-Control', 'no-store');
    next();
  });
  api.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });
  api.post('/email', express.json({ limit: '2kb', inflate: false }), async (request, response) => {
    if (!request.is('application/json')) {
      throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Send the request as application/json.');
    }

    const body: unknown = request.body;
    const submittedEmail = typeof body === 'object' && body !== null && 'email' in body ? body.email : undefined;
    const email = typeof submittedEmail === 'string' ? submittedEmail.trim() : '';
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
      throw new ApiError(400, 'INVALID_EMAIL', 'Enter a valid email address.');
    }

    response.json({ breaches: await hibp.checkEmail(email) });
  });
  api.get('/password/:prefix', async (request, response) => {
    const { prefix } = request.params;
    if (!PREFIX_PATTERN.test(prefix)) {
      throw new ApiError(400, 'INVALID_PREFIX', 'Use exactly five hexadecimal characters.');
    }

    response.type('text/plain').send(await hibp.passwordRange(prefix.toUpperCase()));
  });
  api.use((_request, _response, next) => {
    next(new ApiError(404, 'NOT_FOUND', 'This API endpoint does not exist.'));
  });
  app.use('/api', api);

  if (staticRoot) {
    app.use((_request, response, next) => {
      response.set('Content-Security-Policy', STATIC_CSP);
      next();
    });
    app.get(SPA_PATHS, (_request, response, next) => {
      response.set('Cache-Control', 'no-cache');
      response.sendFile('index.html', { root: staticRoot, cacheControl: false }, (error) => {
        if (error) next(error);
      });
    });
    app.use(express.static(staticRoot, { index: false, redirect: false }));
  }

  app.use((_request, _response, next) => {
    next(new ApiError(404, 'NOT_FOUND', 'This resource was not found.'));
  });
  app.use(respondToError);

  return app;
}
