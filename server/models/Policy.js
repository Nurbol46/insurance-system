const connectDB = require('../config/db');
const { parseDate, sortRows, makeThenable } = require('./helpers');
const Service = require('./Service');
const User = require('./User');

function fromRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    user: row.user_id,
    service: row.service_id || undefined,
    application: row.application_id || undefined,
    policyNumber: row.policy_number,
    status: row.status,
    startDate: parseDate(row.start_date),
    endDate: parseDate(row.end_date),
    createdAt: parseDate(row.created_at),
    updatedAt: parseDate(row.updated_at),
  };
}

async function populatePolicy(doc, populateSpec) {
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

const Policy = {
  find(filter = {}) {
    return makeThenable(async (query) => {
      const db = connectDB.getDb();
      let rows = db.prepare('SELECT * FROM policies').all();

      if (filter.user !== undefined) {
        rows = rows.filter((r) => r.user_id === filter.user);
      }
      if (filter.application !== undefined) {
        rows = rows.filter((r) => r.application_id === filter.application);
      }

      rows = sortRows(rows, query._sort || { createdAt: -1 });
      const docs = rows.map(fromRow);

      if (!query._populate.length) return docs;
      return Promise.all(docs.map((doc) => populatePolicy(doc, query._populate)));
    });
  },

  findOne(filter = {}) {
    return makeThenable(async (query) => {
      const db = connectDB.getDb();
      let row = null;

      if (filter.policyNumber) {
        row = db
          .prepare('SELECT * FROM policies WHERE policy_number = ?')
          .get(filter.policyNumber);
      } else if (filter.application !== undefined) {
        row = db
          .prepare('SELECT * FROM policies WHERE application_id = ?')
          .get(filter.application);
      }

      const doc = fromRow(row);
      if (!doc) return null;
      if (!query._populate.length) return doc;
      return populatePolicy(doc, query._populate);
    });
  },

  create(data) {
    const db = connectDB.getDb();
    const result = db
      .prepare(
        `INSERT INTO policies (user_id, service_id, application_id, policy_number, status, start_date, end_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.user,
        data.service || null,
        data.application || null,
        data.policyNumber,
        data.status || 'pending',
        data.startDate ? data.startDate.toISOString() : null,
        data.endDate ? data.endDate.toISOString() : null
      );

    const row = db.prepare('SELECT * FROM policies WHERE id = ?').get(result.lastInsertRowid);
    return Promise.resolve(fromRow(row));
  },

  updateMany(filter, update) {
    const db = connectDB.getDb();
    if (filter.application !== undefined) {
      db.prepare(
        `UPDATE policies SET status = ?, updated_at = datetime('now') WHERE application_id = ?`
      ).run(update.status, filter.application);
    }
    return Promise.resolve({ modifiedCount: 1 });
  },

  countDocuments(filter = {}) {
    const db = connectDB.getDb();
    if (filter.status) {
      return Promise.resolve(
        db.prepare('SELECT COUNT(*) AS count FROM policies WHERE status = ?').get(filter.status)
          .count
      );
    }
    return Promise.resolve(db.prepare('SELECT COUNT(*) AS count FROM policies').get().count);
  },
};

module.exports = Policy;
