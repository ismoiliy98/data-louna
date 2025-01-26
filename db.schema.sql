CREATE TABLE IF NOT EXISTS users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  balance FLOAT DEFAULT 1000.00 NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  price FLOAT NOT NULL,
  stock INT NOT NULL
);
CREATE TABLE IF NOT EXISTS purchases (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  product_id INT NOT NULL REFERENCES products(id),
  purchase_date TIMESTAMP DEFAULT NOW(),
  quantity INT NOT NULL,
  total_price FLOAT NOT NULL
);
INSERT INTO products (name, price, stock)
VALUES ('AWP | Medusa', 14.99, 100),
  ('M4A4 | Howl', 9.99, 100),
  ('AK-47 | Fire Serpent', 70.45, 100),
  ('Desert Eagle | Blaze', 8.83, 100),
  ('USP-S | Kill Confirmed', 33.33, 100),
  ('AWP | Dragon Lore', 44.55, 100),
  ('M4A4 | Poseidon', 20.11, 100),
  ('AK-47 | Vulcan', 17.13, 100),
  ('Desert Eagle | Golden Koi', 48.22, 100),
  ('USP-S | Orion', 81.65, 100),
  ('M4A4 | X-Ray', 29.99, 100),
  ('AK-47 | Jaguar', 41.99, 100),
  ('Desert Eagle | Cobalt Disruption', 32.51, 100),
  ('USP-S | Stainless', 3.99, 100),
  ('AWP | Hyper Beast', 49.99, 100),
  ('M4A4 | Royal Paladin', 65.33, 100),
  ('AK-47 | Redline', 72.32, 100),
  ('Desert Eagle | Conspiracy', 19.98, 100),
  ('USP-S | Serum', 16.21, 100),
  ('AWP | Lightning Strike', 82.23, 100),
  ('M4A4 | Bullet Rain', 77.77, 100);