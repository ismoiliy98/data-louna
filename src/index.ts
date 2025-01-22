import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { env } from '~/constants';

async function bootstrap() {
  const { PORT: port, NODE_ENV } = env;
  const app = new Hono();

  app.get('/', (c) => {
    return c.text('Hello Hono!');
  });

  serve({ fetch: app.fetch, port });

  console.log(`Server is running in ${NODE_ENV} mode on port ${port}`);
}

bootstrap().catch((error) => {
  console.error(error);
});
