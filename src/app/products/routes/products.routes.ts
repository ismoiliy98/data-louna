import { purchaseProductSchema, readProductSchema } from '$/products/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HttpStatus } from '~/constants';
import { getDBClient } from '~/lib';
import type { AppFactory, Product, User } from '~/types';

export const productsRouter = new Hono<AppFactory>()
  .get('/list', async (c) => {
    const sql = getDBClient();
    const products = await sql<Product[]>`
      SELECT * FROM products
    `;

    return c.json(products);
  })
  .get('/:id', zValidator('param', readProductSchema), async (c) => {
    const sql = getDBClient();
    const { id } = c.req.valid('param');
    const [product] = await sql<Product[]>`
      SELECT * FROM products WHERE id = ${id} LIMIT 1
    `;

    if (!product) {
      throw new HTTPException(HttpStatus.NotFound, {
        message: 'Product not found',
      });
    }

    return c.json(product);
  })
  .post('/purchase', zValidator('json', purchaseProductSchema), async (c) => {
    const sql = getDBClient();
    const { productId, quantity } = c.req.valid('json');
    const session = c.get('session');

    if (!session) {
      throw new HTTPException(HttpStatus.Unauthorized, {
        message: 'Unauthorized',
      });
    }

    const [[product], [user]] = await Promise.all([
      sql<Product[]>`
        SELECT * FROM products WHERE id = ${productId} LIMIT 1
      `,
      sql<Pick<User, 'balance'>[]>`
        SELECT balance FROM users WHERE id = ${session.userId} LIMIT 1
      `,
    ]);

    if (!user) {
      throw new HTTPException(HttpStatus.Unauthorized, {
        message: 'Unauthorized',
      });
    }

    if (!product) {
      throw new HTTPException(HttpStatus.NotFound, {
        message: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      throw new HTTPException(HttpStatus.BadRequest, {
        message: 'Insufficient stock',
      });
    }

    const totalPrice = Number((product.price * quantity).toFixed(2));

    if (user.balance < totalPrice) {
      throw new HTTPException(HttpStatus.BadRequest, {
        message: 'Insufficient balance',
      });
    }

    const newBalance = Number((user.balance - totalPrice).toFixed(2));
    const newStock = product.stock - quantity;

    await sql.begin((sql) => [
      sql<Pick<User, 'balance'>[]>`
        UPDATE users SET balance = ${newBalance}
        WHERE id = ${session.userId}
        RETURNING balance
      `,
      sql`
        INSERT INTO purchases (user_id, product_id, quantity, total_price)
        VALUES (${session.userId}, ${productId}, ${quantity}, ${totalPrice})
      `,
      sql`
        UPDATE products SET stock = ${newStock}
        WHERE id = ${productId}
      `,
    ]);

    return c.json({ newBalance, message: 'Purchase successful' });
  });
