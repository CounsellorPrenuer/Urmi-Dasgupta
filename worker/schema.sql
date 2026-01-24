CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL, -- created, paid, failed
    plan_id TEXT NOT NULL,
    coupon_code TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coupon_code TEXT NOT NULL,
    order_id TEXT NOT NULL,
    redeemed_at INTEGER NOT NULL,
    FOREIGN KEY(order_id) REFERENCES transactions(order_id)
);
