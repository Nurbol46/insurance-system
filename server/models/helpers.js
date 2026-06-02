function parseDate(value) {
  return value ? new Date(value) : undefined;
}

function sortRows(rows, sortSpec) {
  if (!sortSpec) return rows;
  const [[field, direction]] = Object.entries(sortSpec);
  const dir = direction === -1 ? -1 : 1;
  const key = field === 'createdAt' ? 'created_at' : field;

  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function makeThenable(executor) {
  const query = {
    _populate: [],
    _sort: null,
    _select: null,
    populate(field, select) {
      this._populate.push({ field, select });
      return this;
    },
    sort(spec) {
      this._sort = spec;
      return this;
    },
    select(fields) {
      this._select = fields;
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve()
        .then(() => executor(this))
        .then(resolve, reject);
    },
  };
  return query;
}

module.exports = { parseDate, sortRows, makeThenable };
