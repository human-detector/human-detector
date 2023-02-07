import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.use(bodyParser.json({ limit: '50mb' }));
  // Dummy route for health checks w/ AWS Load Balancer
  app.getHttpAdapter().get('/', (req, res, next) => {
    res.send('ok');
  });
  await app.listen(3000);
}
bootstrap();
