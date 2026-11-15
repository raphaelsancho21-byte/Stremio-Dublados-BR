'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { manifest, addonInterface } = require('../addon');

test('manifest exposes only catalog and metadata', () => {
  assert.equal(manifest.id, 'br.dublados.stremio');
  assert.deepEqual(manifest.resources, ['catalog', 'meta']);
});

test('catalog includes The Rookie', async () => {
  const result = await addonInterface.get({ resource: 'catalog', type: 'series', id: 'series-ptbr', extra: {} });
  assert.equal(result.metas.length, 1);
  assert.equal(result.metas[0].id, 'tt7587890');
});

test('search skips unrelated series', async () => {
  const result = await addonInterface.get({ resource: 'catalog', type: 'series', id: 'series-ptbr', extra: {search: 'uma série inexistente'} });
  assert.deepEqual(result.metas, []);
});
