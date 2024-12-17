import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { STATUS_CODES } from 'http';

@Catch()
export class AppFilter<T> extends BaseExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response<ApiResponse>>();

    console.log(exception);

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2003':
        case 'P2025':
          return response.status(HttpStatus.NOT_FOUND).json({
            statusCode: HttpStatus.NOT_FOUND,
            message: STATUS_CODES[HttpStatus.NOT_FOUND] ?? 'Not Found',
          });
        case 'P2002':
          const { modelName, target } = exception.meta ?? {};
          return response.status(HttpStatus.CONFLICT).json({
            statusCode: HttpStatus.CONFLICT,
            message: `Duplicate on ${target} of ${modelName}`,
          });
      }
    }
    super.catch(exception, host);
  }
}
