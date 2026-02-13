-- Verbena Vibes - Database Schema

-- Products table (granizados, toppings, extras)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category VARCHAR(50) NOT NULL DEFAULT 'granizado', -- granizado, topping, extra
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  stock_quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'unidad', -- unidad, litro, kg
  min_stock NUMERIC(10,2) NOT NULL DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) NOT NULL UNIQUE,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  delivery_type VARCHAR(20) NOT NULL DEFAULT 'local', -- local, domicilio
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(20) NOT NULL DEFAULT 'efectivo', -- efectivo, transferencia
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'pendiente', -- pendiente, preparando, listo, entregado, cancelado
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items (each cup/vaso in an order)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order item toppings (toppings for each cup)
CREATE TABLE IF NOT EXISTS order_item_toppings (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  topping_name VARCHAR(255) NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Seed default products
INSERT INTO products (name, description, price, category) VALUES
  ('Granizado de Fresa', 'Granizado natural de fresa fresca', 8000, 'granizado'),
  ('Granizado de Mango', 'Granizado tropical de mango maduro', 8000, 'granizado'),
  ('Granizado de Limon', 'Granizado refrescante de limon', 7000, 'granizado'),
  ('Granizado de Mora', 'Granizado de mora silvestre', 8000, 'granizado'),
  ('Granizado de Maracuya', 'Granizado de maracuya tropical', 8500, 'granizado'),
  ('Granizado Mixto', 'Combinacion de sabores a eleccion', 9000, 'granizado'),
  ('Leche Condensada', 'Topping de leche condensada', 1500, 'topping'),
  ('Chispas de Chocolate', 'Topping de chispas de chocolate', 1000, 'topping'),
  ('Gomitas', 'Topping de gomitas de colores', 1000, 'topping'),
  ('Crema Chantilly', 'Topping de crema chantilly', 1500, 'topping'),
  ('Galleta Oreo', 'Topping de galleta Oreo triturada', 1500, 'topping'),
  ('Frutas Frescas', 'Topping de frutas frescas picadas', 2000, 'topping')
ON CONFLICT DO NOTHING;

-- Seed inventory for all products
INSERT INTO inventory (product_id, stock_quantity, unit, min_stock)
SELECT id, 50, 
  CASE WHEN category = 'granizado' THEN 'litro' ELSE 'unidad' END,
  10
FROM products
ON CONFLICT DO NOTHING;
