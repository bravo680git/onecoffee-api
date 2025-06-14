import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestValidationPipe } from './lib/pipes/validation.pipe';
import { TransformResponseInterceptor } from './lib/interceptors/transform-response.interceptor';
import { AppFilter } from './lib/filters/app.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });

  app.setGlobalPrefix('/v1/api');
  app.useGlobalPipes(new RequestValidationPipe());
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AppFilter(httpAdapter));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
