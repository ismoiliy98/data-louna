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
    const { userId } = c.get('session') || { userId: null };

    if (!userId) {
      throw new HTTPException(HttpStatus.Unauthorized, {
        message: 'Unauthorized',
      });
    }

    const newBalance = await sql.begin(async (sql) => {
      const [product] = await sql<Pick<Product, 'stock' | 'price'>[]>`
        SELECT p.stock, p.price
        FROM users u, products p
        WHERE u.id = ${userId} AND p.id = ${productId} 
        FOR UPDATE
      `;

      if (!product) {
        throw new HTTPException(HttpStatus.BadRequest, {
          message: 'Product or User not found',
        });
      }

      const updatedProducts = await sql`
        UPDATE products
        SET stock = stock - ${quantity}
        WHERE id = ${productId} AND stock >= ${quantity}
        RETURNING stock
      `;

      if (updatedProducts.length < 1) {
        throw new HTTPException(HttpStatus.BadRequest, {
          message: 'Insufficient stock',
        });
      }

      const totalPrice = product.price * quantity;
      const [updatedUser] = await sql<Pick<User, 'balance'>[]>`
        UPDATE users
        SET balance = ROUND((balance - ${totalPrice})::numeric, 2)
        WHERE id = ${userId} AND balance >= ${totalPrice}
        RETURNING balance
      `;

      if (!updatedUser) {
        throw new HTTPException(HttpStatus.BadRequest, {
          message: 'Insufficient balance',
        });
      }

      await sql`
        INSERT INTO purchases (user_id, product_id, quantity, total_price)
        VALUES (
          ${userId},
          ${productId},
          ${quantity},
          ROUND(${totalPrice}, 2)
        )
      `;

      return updatedUser.balance;
    });

    return c.json({ newBalance, message: 'Purchase successful' });
  });
