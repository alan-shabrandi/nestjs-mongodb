import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { enableLocal, isDev, Sentry } from 'src/config/sentry.config';
import { logger } from '../utils/logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      exception instanceof HttpException
        ? JSON.stringify(exception.getResponse())
        : String(exception);

    // Log with Winston
    logger.error(
      `HTTP ${status} ${request.method} ${request.url} | Body: ${JSON.stringify(
        request.body,
      )} | Query: ${JSON.stringify(request.query)} | Params: ${JSON.stringify(
        request.params,
      )} | Error: ${errorMessage}`,
      { stack: (exception as any)?.stack },
    );

    // Capture in Sentry only if allowed
    if (!isDev || (isDev && enableLocal)) {
      Sentry.captureException(exception, {
        tags: {
          path: request.url,
          method: request.method,
          isLocal: isDev.toString(),
        },
        extra: {
          body: request.body,
          query: request.query,
          params: request.params,
        },
      });
    } else {
      console.error('⚠️ Local Error (Not sent to Sentry):', {
        exception,
        path: request.url,
        method: request.method,
        body: request.body,
        query: request.query,
        params: request.params,
      });
    }

    // Response to client
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Internal server error',
    });
  }
}
