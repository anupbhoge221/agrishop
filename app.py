
import os
import psycopg2
import psycopg2.extras
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

# ─── PostgreSQL connection (reads DATABASE_URL from Render env) ────────────────
DATABASE_URL = os.environ.get("DATABASE_URL")


def connect():
    """Return a new psycopg2 connection."""
    return psycopg2.connect(DATABASE_URL)


def run(sql, params=None):
    """Run one query. Returns rows (list of dicts) for SELECT queries."""
    conn = connect()
    try:
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(sql, params)
        rows = cur.fetchall() if cur.description else []
        conn.commit()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def insert(sql, params=None):
    """Run one INSERT … RETURNING id and return the new id."""
    conn = connect()
    try:
        cur = conn.cursor()
        cur.execute(sql, params)
        row = cur.fetchone()
        conn.commit()
        return row[0] if row else None
    finally:
        conn.close()


# ─── Error handler ─────────────────────────────────────────────────────────────
@app.errorhandler(psycopg2.Error)
def db_error(e):
    pgcode = e.pgcode or ""
    if pgcode == "23505":
        msg = "That record already exists (duplicate phone or name)."
    elif pgcode == "23503":
        msg = "This record is linked to other data."
    elif pgcode == "23514":
        msg = "Not enough stock, or a value is out of range."
    else:
        msg = str(e).split("\n")[0]
    return jsonify(error=msg), 400


# ─── Routes ────────────────────────────────────────────────────────────────────
@app.route("/")
def home():
    return render_template("index.html")


@app.get("/api/lookups")
def lookups():
    return jsonify(
        categories=run("SELECT category_id, category_name FROM category ORDER BY category_name"),
        suppliers=run("SELECT supplier_id, supplier_name FROM supplier ORDER BY supplier_name"),
        customers=run("SELECT customer_id, full_name, village FROM customer ORDER BY full_name"),
    )


@app.get("/api/products")
def list_products():
    q = request.args.get("q", "")
    like = f"%{q}%"
    return jsonify(run("""
        SELECT p.product_id, p.product_name, c.category_name, s.supplier_name,
               p.unit_price, p.stock_qty, p.unit
        FROM product p
        JOIN category c ON c.category_id = p.category_id
        JOIN supplier s ON s.supplier_id = p.supplier_id
        WHERE p.product_name ILIKE %s OR c.category_name ILIKE %s
        ORDER BY p.product_name""", (like, like)))


@app.post("/api/products")
def add_product():
    d = request.get_json()
    new_id = insert("""INSERT INTO product (product_name, category_id, supplier_id,
                                             unit_price, stock_qty, unit)
                       VALUES (%s,%s,%s,%s,%s,%s)
                       RETURNING product_id""",
                    (d["name"], d["category_id"], d["supplier_id"],
                     d["price"], d["stock"], d["unit"]))
    return jsonify(product_id=new_id), 201


@app.post("/api/customers")
def add_customer():
    d = request.get_json()
    new_id = insert("""INSERT INTO customer (full_name, phone, village, district)
                       VALUES (%s,%s,%s,%s)
                       RETURNING customer_id""",
                    (d["name"], d["phone"], d["village"], d["district"]))
    return jsonify(customer_id=new_id), 201


@app.get("/api/orders")
def list_orders():
    return jsonify(run("SELECT * FROM order_summary ORDER BY order_id DESC"))


@app.post("/api/orders")
def create_order():
    """Creates an order and its items in ONE transaction.
    Stock is reduced by the trg_reduce_stock trigger on order_items."""
    d = request.get_json()
    if not d.get("items"):
        return jsonify(error="Add at least one product."), 400
    conn = connect()
    try:
        cur = conn.cursor()
        cur.execute("""INSERT INTO orders (customer_id, payment_method)
                       VALUES (%s,%s) RETURNING order_id""",
                    (d["customer_id"], d["payment_method"]))
        oid = cur.fetchone()[0]
        for it in d["items"]:
            cur.execute("""INSERT INTO order_items (order_id, product_id, quantity, price_at_sale)
                           SELECT %s, product_id, %s, unit_price
                           FROM product WHERE product_id = %s""",
                        (oid, it["quantity"], it["product_id"]))
        conn.commit()
        return jsonify(order_id=oid), 201
    except psycopg2.Error:
        conn.rollback()
        raise
    finally:
        conn.close()


@app.patch("/api/orders/<int:order_id>")
def update_status(order_id):
    run("UPDATE orders SET status = %s WHERE order_id = %s",
        (request.get_json()["status"], order_id))
    return jsonify(ok=True)


@app.get("/api/reports")
def reports():
    return jsonify(
        revenue=run("""SELECT c.category_name, SUM(oi.quantity * oi.price_at_sale) AS revenue
                       FROM order_items oi
                       JOIN product p ON p.product_id = oi.product_id
                       JOIN category c ON c.category_id = p.category_id
                       GROUP BY c.category_name ORDER BY revenue DESC LIMIT 6"""),
        low_stock=run("""SELECT product_name, stock_qty, unit FROM product
                         WHERE stock_qty < 50 ORDER BY stock_qty"""),
        totals=run("""SELECT (SELECT COUNT(*) FROM product)  AS products,
                             (SELECT COUNT(*) FROM customer) AS customers,
                             (SELECT COUNT(*) FROM orders)   AS orders""")[0],
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
