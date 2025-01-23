import { authGuard } from '$/auth/middlewares';
import { authRouter } from '$/auth/routes';
import { skinportRouter } from '$/skinport/routes';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Env } from '~/constants';

async function bootstrap() {
  const { PORT: port, NODE_ENV } = Env;
  const app = new Hono().basePath('/api');
  const protectedApp = new Hono().use(authGuard);

  protectedApp.route('/skinport', skinportRouter);

  app.route('/auth', authRouter);
  app.route('/', protectedApp);

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return err.getResponse();
    }

    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  });

  serve({ fetch: app.fetch, port });
  console.log(`Server is running in ${NODE_ENV} mode on port ${port}`);
}

bootstrap().catch((error) => {
  console.error(error);
});
