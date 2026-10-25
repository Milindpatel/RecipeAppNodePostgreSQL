import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { newDb } from 'pg-mem';
import { createApp } from '../app';
import { recipeRepo } from '../db/recipes';

let app;
let pool;

beforeEach(async () => {
  const { Pool } = newDb().adapters.createPg();
  pool = new Pool();
  await recipeRepo(pool).init();
  app = createApp(pool);
});

const lagaan = { title: 'Dal', ingredients: 'Lentils\nSalt', directions: 'Boil the lentils.' };
const add = (fields = lagaan) => request(app).post('/add').type('form').send(fields);
const rows = async () => (await pool.query('SELECT * FROM recipe ORDER BY id')).rows;

describe('recipes', () => {
  it('shows an empty list', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('No recipes yet');
  });

  it('adds a recipe and lists it', async () => {
    const res = await add();
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
    expect(await rows()).toMatchObject([{ id: 1, title: 'Dal' }]);
    expect((await request(app).get('/')).text).toContain('Boil the lentils.');
  });

  it('edits a recipe', async () => {
    await add();
    await request(app).post('/edit').type('form').send({ ...lagaan, id: '1', title: 'Tadka Dal' });
    expect((await rows())[0].title).toBe('Tadka Dal');
  });

  it('deletes a recipe', async () => {
    await add();
    expect((await request(app).delete('/delete/1')).status).toBe(204);
    expect(await rows()).toHaveLength(0);
    expect((await request(app).delete('/delete/1')).status).toBe(404);
    expect((await request(app).delete('/delete/abc')).status).toBe(404);
  });

  it('rejects incomplete recipes and unknown ids', async () => {
    const res = await add({ title: 'Only a title' });
    expect(res.headers.location).toMatch(/^\/\?error=/);
    expect(await rows()).toHaveLength(0);

    const edit = await request(app).post('/edit').type('form').send({ ...lagaan, id: '99' });
    expect(decodeURIComponent(edit.headers.location)).toContain('no longer exists');
  });

  it('escapes recipe text in the page', async () => {
    await add({ ...lagaan, title: '<img src=x onerror=alert(1)>' });
    const html = (await request(app).get('/')).text;
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('escapes the error message from the query string', async () => {
    const html = (await request(app).get('/?error=<script>x</script>')).text;
    expect(html).not.toContain('<script>x</script>');
  });

  it('serves Bootstrap and the page script', async () => {
    expect((await request(app).get('/vendor/bootstrap/js/bootstrap.bundle.min.js')).status).toBe(200);
    expect((await request(app).get('/js/main.js')).status).toBe(200);
  });
});
