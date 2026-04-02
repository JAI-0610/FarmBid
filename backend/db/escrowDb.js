const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "escrow.sqlite");
const db = new Database(dbPath, { verbose: console.log });

db.pragma("journal_mode = WAL");

const initDb = () => {
  const createTableStmt = `
    CREATE TABLE IF NOT EXISTS escrow_orders (
      order_id     TEXT PRIMARY KEY,
      buyer_addr   TEXT,
      farmer_addr  TEXT,
      amount_matic REAL,
      tx_hash      TEXT,
      status       TEXT DEFAULT 'LOCKED',
      reason       TEXT,
      created_at   TEXT DEFAULT (datetime('now')),
      updated_at   TEXT DEFAULT (datetime('now'))
    );
  `;
  db.exec(createTableStmt);
};

initDb();

function insertOrder(order) {
  const { orderId, buyerAddr, farmerAddr, amountMatic, txHash, status } = order;
  const stmt = db.prepare(`
    INSERT INTO escrow_orders (order_id, buyer_addr, farmer_addr, amount_matic, tx_hash, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const info = stmt.run(orderId, buyerAddr || null, farmerAddr, amountMatic, txHash, status || 'LOCKED');
  return info;
}

function updateOrderStatus(orderId, status, reason = null) {
  const stmt = db.prepare(`
    UPDATE escrow_orders
    SET status = ?, reason = ?, updated_at = datetime('now')
    WHERE order_id = ?
  `);
  
  const info = stmt.run(status, reason, orderId);
  return info;
}

function getOrder(orderId) {
  const stmt = db.prepare(`SELECT * FROM escrow_orders WHERE order_id = ?`);
  return stmt.get(orderId);
}

module.exports = {
  db,
  insertOrder,
  updateOrderStatus,
  getOrder
};
