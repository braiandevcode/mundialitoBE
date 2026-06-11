import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      // Extraigo el mensaje del error, puede venir como string u objeto
      message = typeof res === 'string' ? res : (res as Record<string, unknown>).message as string || message;
    }

    // Si message llega como array (ej: validaciones fallidas), tomo el primero
    const errorMessage = Array.isArray(message) ? message[0] : message;

    response.status(status).json({
      error: errorMessage,
    });
  }
}
