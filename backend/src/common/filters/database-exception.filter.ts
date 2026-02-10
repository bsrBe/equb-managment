import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Postgres unique constraint violation
    if ((exception as any).code === '23505') {
      status = HttpStatus.CONFLICT;
      const detail = (exception as any).detail || '';
      if (detail.includes('periodKey')) {
        message = 'A record for this member already exists for this period. Duplicate entries are not allowed.';
      } else {
        message = 'A record with this information already exists. Please check your data.';
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
      error: exception.name,
    });
  }
}
