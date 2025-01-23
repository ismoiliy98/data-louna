import { skinportService } from '$/skinport/services';
import { Hono } from 'hono';

export const skinportRouter = new Hono().get('/items', async (c) => {
  const items = await skinportService.getItems();
  return c.json(items);
});
