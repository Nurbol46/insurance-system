const connectDB = require('../config/db');
const { parseDate, sortRows } = require('./helpers');

function fromRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    price: row.price,
    createdAt: parseDate(row.created_at),
    updatedAt: parseDate(row.updated_at),
  };
}

const Service = {
  find() {
    return {
      sort(sortSpec) {
        return Promise.resolve().then(() => {
          const db = connectDB.getDb();
          const rows = db.prepare('SELECT * FROM services').all();
          return sortRows(rows, sortSpec || { createdAt: 1 }).map(fromRow);
        });
      },
    };
  },

  findById(id) {
    const db = connectDB.getDb();
    const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    return Promise.resolve(fromRow(row));
  },

  create(data) {
    const db = connectDB.getDb();
    const result = db
      .prepare(
        `INSERT INTO services (title, description, category, price)
         VALUES (?, ?, ?, ?)`
      )
      .run(data.title, data.description, data.category, data.price ?? 0);

    const row = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    return Promise.resolve(fromRow(row));
  },

  insertMany(items) {
    const db = connectDB.getDb();
    const insert = db.prepare(
      `INSERT INTO services (title, description, category, price)
       VALUES (?, ?, ?, ?)`
    );

    const created = db.transaction((list) => {
      return list.map((item) => {
        const result = insert.run(item.title, item.description, item.category, item.price ?? 0);
        const row = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
        return fromRow(row);
      });
    })(items);

    return Promise.resolve(created);
  },

  findByIdAndUpdate(id, data) {
    const db = connectDB.getDb();
    const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    if (!existing) return Promise.resolve(null);

    db.prepare(
      `UPDATE services
       SET title = ?, description = ?, category = ?, price = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(data.title, data.description, data.category, data.price ?? 0, id);

    const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    return Promise.resolve(fromRow(row));
  },

  findByIdAndDelete(id) {
    const db = connectDB.getDb();
    const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    if (!row) return Promise.resolve(null);

    db.prepare('DELETE FROM services WHERE id = ?').run(id);
    return Promise.resolve(fromRow(row));
  },

  countDocuments() {
    const db = connectDB.getDb();
    return Promise.resolve(db.prepare('SELECT COUNT(*) AS count FROM services').get().count);
  },
};

module.exports = Service;
