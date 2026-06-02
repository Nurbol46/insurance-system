const connectDB = require('../config/db');
const { parseDate, sortRows, makeThenable } = require('./helpers');
const Service = require('./Service');
const User = require('./User');

function fromRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    user: row.user_id || undefined,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service: row.service_id || undefined,
    serviceTitle: row.service_title,
    message: row.message,
    status: row.status,
    createdAt: parseDate(row.created_at),
    updatedAt: parseDate(row.updated_at),
    async save() {
      const db = connectDB.getDb();
      db.prepare(
        `UPDATE applications
         SET status = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(this.status, this._id);
      return this;
    },
  };
}

async function populateApplication(doc, populateSpec) {
  const result = { ...doc };

  for (const spec of populateSpec) {
    if (spec.field === 'service' && doc.service) {
      result.service = await Service.findById(doc.service);
    }
    if (spec.field === 'user' && doc.user) {
      const user = await User.findById(doc.user);
      if (user && spec.select) {
        const fields = spec.select.split(/\s+/).filter(Boolean);
        const partial = { _id: user._id };
        for (const field of fields) {
          partial[field] = user[field];
        }
        result.user = partial;
      } else {
        result.user = user;
      }
    }
  }

  return result;
}

function matchesFilter(row, filter) {
  if (filter.$or) {
    return filter.$or.some((clause) => {
      if (clause.user !== undefined) return row.user_id === clause.user;
      if (clause.email !== undefined) {
        return row.email.toLowerCase() === clause.email.toLowerCase();
      }
      return false;
    });
  }
  return true;
}

const Application = {
  create(data) {
    const db = connectDB.getDb();
    const result = db
      .prepare(
        `INSERT INTO applications (user_id, name, email, phone, service_id, service_title, message, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.user || null,
        data.name,
        data.email,
        data.phone,
        data.service || null,
        data.serviceTitle || '',
        data.message || '',
        data.status || 'pending'
      );

    const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(result.lastInsertRowid);
    return Promise.resolve(fromRow(row));
  },

  findById(id) {
    return makeThenable(async (query) => {
      const db = connectDB.getDb();
      const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
      const doc = fromRow(row);
      if (!doc) return null;
      if (query._populate.length) {
        return populateApplication(doc, query._populate);
      }
      return doc;
    });
  },

  find(filter = {}) {
    return makeThenable(async (query) => {
      const db = connectDB.getDb();
      let rows = db.prepare('SELECT * FROM applications').all();
      rows = rows.filter((row) => matchesFilter(row, filter));
      rows = sortRows(rows, query._sort || { createdAt: -1 });

      const docs = rows.map(fromRow);
      if (!query._populate.length) return docs;

      return Promise.all(docs.map((doc) => populateApplication(doc, query._populate)));
    });
  },

  countDocuments(filter = {}) {
    const db = connectDB.getDb();
    if (filter.status) {
      return Promise.resolve(
        db
          .prepare('SELECT COUNT(*) AS count FROM applications WHERE status = ?')
          .get(filter.status).count
      );
    }
    return Promise.resolve(db.prepare('SELECT COUNT(*) AS count FROM applications').get().count);
  },
};

module.exports = Application;
