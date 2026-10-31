-- ============================================================
--  AgriShop – PostgreSQL schema
--  Run this once in your Render PostgreSQL database
-- ============================================================

-- ── Tables ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS category (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS supplier (
    supplier_id   SERIAL PRIMARY KEY,
    supplier_name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS product (
    product_id   SERIAL PRIMARY KEY,
    product_name VARCHAR(80)    NOT NULL,
    category_id  INT            NOT NULL REFERENCES category(category_id),
    supplier_id  INT            NOT NULL REFERENCES supplier(supplier_id),
    unit_price   NUMERIC(10,2)  NOT NULL CHECK (unit_price > 0),
    stock_qty    INT            NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    unit         VARCHAR(15)    NOT NULL
);

CREATE TABLE IF NOT EXISTS customer (
    customer_id SERIAL PRIMARY KEY,
    full_name   VARCHAR(60) NOT NULL,
    phone       CHAR(10)    NOT NULL UNIQUE,
    village     VARCHAR(60) NOT NULL,
    district    VARCHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    order_id       SERIAL PRIMARY KEY,
    customer_id    INT         NOT NULL REFERENCES customer(customer_id),
    payment_method VARCHAR(20) NOT NULL DEFAULT 'Cash',
    status         VARCHAR(20) NOT NULL DEFAULT 'Pending',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    item_id       SERIAL PRIMARY KEY,
    order_id      INT           NOT NULL REFERENCES orders(order_id),
    product_id    INT           NOT NULL REFERENCES product(product_id),
    quantity      INT           NOT NULL CHECK (quantity > 0),
    price_at_sale NUMERIC(10,2) NOT NULL
);

-- ── View ──────────────────────────────────────────────────────
CREATE OR REPLACE VIEW order_summary AS
    SELECT o.order_id,
           c.full_name   AS customer_name,
           c.village,
           o.payment_method,
           o.status,
           o.created_at,
           SUM(oi.quantity * oi.price_at_sale) AS total
    FROM orders o
    JOIN customer c  ON c.customer_id  = o.customer_id
    JOIN order_items oi ON oi.order_id = o.order_id
    GROUP BY o.order_id, c.full_name, c.village, o.payment_method, o.status, o.created_at;

-- ── Trigger: reduce stock on new order item ───────────────────
CREATE OR REPLACE FUNCTION fn_reduce_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE product
       SET stock_qty = stock_qty - NEW.quantity
     WHERE product_id = NEW.product_id;
    IF (SELECT stock_qty FROM product WHERE product_id = NEW.product_id) < 0 THEN
        RAISE EXCEPTION 'Not enough stock for product %', NEW.product_id
              USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reduce_stock ON order_items;
CREATE TRIGGER trg_reduce_stock
AFTER INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION fn_reduce_stock();

-- ── Seed data (safe to re-run) ────────────────────────────────
INSERT INTO category (category_name) VALUES
    ('Seeds'), ('Fertilizers'), ('Pesticides'), ('Tools'), ('Irrigation')
ON CONFLICT DO NOTHING;

INSERT INTO supplier (supplier_name) VALUES
    ('Mahindra AgriTech'), ('Bayer CropScience'), ('UPL Limited'), ('Syngenta India')
ON CONFLICT DO NOTHING;

