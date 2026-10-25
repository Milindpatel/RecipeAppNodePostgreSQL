const fs = require('node:fs');
const path = require('node:path');

const SCHEMA = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

/** Recipe queries. `db` is anything with pg's `query(text, params)` (a Pool or a test double). */
function recipeRepo(db) {
  return {
    init: () => db.query(SCHEMA),
    all: async () => (await db.query('SELECT id, title, ingredients, directions FROM recipe ORDER BY id')).rows,
    add: ({ title, ingredients, directions }) =>
      db.query('INSERT INTO recipe (title, ingredients, directions) VALUES ($1, $2, $3)', [title, ingredients, directions]),
    async update(id, { title, ingredients, directions }) {
      const res = await db.query('UPDATE recipe SET title = $1, ingredients = $2, directions = $3 WHERE id = $4', [
        title,
        ingredients,
        directions,
        id,
      ]);
      return res.rowCount > 0;
    },
    async remove(id) {
      return (await db.query('DELETE FROM recipe WHERE id = $1', [id])).rowCount > 0;
    },
  };
}

module.exports = { recipeRepo };
