const { Pool } = require('pg');
const { createApp } = require('./app');
const { recipeRepo } = require('./db/recipes');

const port = Number(process.env.PORT) || 3000;
// Standard libpq settings (PGHOST, PGUSER, ...) are used when DATABASE_URL is not set.
const pool = new Pool(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {});

recipeRepo(pool)
  .init()
  .then(() => {
    createApp(pool).listen(port, () => console.log(`RecipeBook running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('Could not connect to PostgreSQL:', err.message);
    process.exit(1);
  });
