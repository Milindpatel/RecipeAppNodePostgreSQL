# RecipeBook (Node.js + PostgreSQL)

A small recipe manager: add recipes, expand one to read the ingredients and directions, edit it in a dialog, or delete it. Built with Express 5, EJS views, Bootstrap 5 and PostgreSQL (`pg`).

## Requirements

- Node.js 20 or newer
- PostgreSQL

## Running it

```sh
createdb recipebookdb
npm install
DATABASE_URL=postgres://USER:PASSWORD@localhost/recipebookdb npm start   # http://localhost:3000
```

The `recipe` table is created on start-up (see `db/schema.sql`). Instead of `DATABASE_URL` you can use the standard `PGHOST`, `PGUSER`, `PGPASSWORD` and `PGDATABASE` variables. Set `PORT` to change the port.

## Tests

```sh
npm test
```

The tests run against an in-memory PostgreSQL emulator ([pg-mem](https://github.com/oguimbal/pg-mem)), so no database server is needed. CI runs them on every push.
