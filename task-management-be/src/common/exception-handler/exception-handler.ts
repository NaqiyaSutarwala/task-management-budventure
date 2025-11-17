import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? (exception.getResponse() as any).message || exception.message
      : 'Internal server error';

    return response.status(status).json({
      statusCode: status,
      message,
      error:
        exception.name ||
        (isHttpException ? 'HttpException' : 'InternalServerError'),
      timestamp: new Date().toISOString(),
    });
  }
}
