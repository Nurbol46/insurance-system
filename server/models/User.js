const connectDB = require('../config/db');
const { parseDate, sortRows, makeThenable } = require('./helpers');

function fromRow(row, { excludePassword = false } = {}) {
  if (!row) return null;
  const doc = {
    _id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    password: row.password,
    role: row.role,
    createdAt: parseDate(row.created_at),
    updatedAt: parseDate(row.updated_at),
  };
  if (excludePassword) delete doc.password;
  return doc;
}

function runFind(options = {}) {
  const db = connectDB.getDb();
  let rows = db.prepare('SELECT * FROM users').all();

  if (options.role) {
    rows = rows.filter((r) => r.role === options.role);
  }

  rows = sortRows(rows, options.sort || { createdAt: -1 });
  return rows.map((r) => fromRow(r, { excludePassword: options.excludePassword }));
}

const User = {
  findOne(query) {
    const db = connectDB.getDb();
    let row = null;

    if (query.email) {
      row = db.prepare('SELECT * FROM users WHERE email = ?').get(query.email);
    } else if (query.role) {
      row = db.prepare('SELECT * FROM users WHERE role = ?').get(query.role);
    }

    return Promise.resolve(fromRow(row));
  },

  findById(id, options = {}) {
    const db = connectDB.getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    const excludePassword = options.select === '-password';
    return Promise.resolve(fromRow(row, { excludePassword }));
  },

  find(filter = {}) {
    return makeThenable((query) => {
      const excludePassword = query._select === '-password';
      return runFind({
        role: filter.role,
        sort: query._sort,
        excludePassword,
      });
    });
  },

  create(data) {
    const db = connectDB.getDb();
    const result = db
      .prepare(
        `INSERT INTO users (name, email, phone, password, role)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(data.name, data.email, data.phone || '', data.password, data.role || 'client');

    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    return Promise.resolve(fromRow(row));
  },

  countDocuments(filter = {}) {
    const db = connectDB.getDb();
    if (filter.role) {
      return Promise.resolve(
        db.prepare('SELECT COUNT(*) AS count FROM users WHERE role = ?').get(filter.role).count
      );
    }
    return Promise.resolve(db.prepare('SELECT COUNT(*) AS count FROM users').get().count);
  },
};

module.exports = User;
