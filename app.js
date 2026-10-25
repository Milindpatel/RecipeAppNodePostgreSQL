const path = require('node:path');
const express = require('express');
const { recipeRepo } = require('./db/recipes');

/** Trimmed recipe fields from a form, or an error message. */
function readRecipe(body = {}) {
  const recipe = {
    title: String(body.title ?? '').trim(),
    ingredients: String(body.ingredients ?? '').trim(),
    directions: String(body.directions ?? '').trim(),
  };
  if (!recipe.title || !recipe.ingredients || !recipe.directions) return { error: 'Please fill in every field.' };
  if (recipe.title.length > 200) return { error: 'The recipe name is too long (200 characters max).' };
  return { recipe };
}

/** Positive integer id, or null. */
function readId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
}

function createApp(db) {
  const recipes = recipeRepo(db);
  const app = express();
  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
  app.use(express.urlencoded({ extended: false, limit: '50kb' }));

  app.get('/', async (req, res) => {
    res.render('index', { recipes: await recipes.all(), error: req.query.error || null });
  });

  app.post('/add', async (req, res) => {
    const { recipe, error } = readRecipe(req.body);
    if (error) return res.redirect(`/?error=${encodeURIComponent(error)}`);
    await recipes.add(recipe);
    return res.redirect('/');
  });

  app.post('/edit', async (req, res) => {
    const id = readId(req.body.id);
    const { recipe, error } = readRecipe(req.body);
    if (!id || error) return res.redirect(`/?error=${encodeURIComponent(error || 'Unknown recipe.')}`);
    if (!(await recipes.update(id, recipe))) return res.redirect(`/?error=${encodeURIComponent('That recipe no longer exists.')}`);
    return res.redirect('/');
  });

  app.delete('/delete/:id', async (req, res) => {
    const id = readId(req.params.id);
    if (!id || !(await recipes.remove(id))) return res.sendStatus(404);
    return res.sendStatus(204);
  });

  app.use((req, res) => res.status(404).send('Not found'));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong');
  });

  return app;
}

module.exports = { createApp, recipeRepo };
