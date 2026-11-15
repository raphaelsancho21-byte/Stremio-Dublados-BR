'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { manifest, addonInterface, getStreamsFor, validStream } = require('../addon');

test('manifest declares stream support', () => {
  assert.equal(manifest.id, 'br.dublados.stremio');
  assert.deepEqual(manifest.resources, ['catalog', 'meta', 'stream']);
});

test('catalog contains The Rookie', async () => {
  const result = await addonInterface.get({ resource: 'catalog', type: 'series', id: 'series-ptbr', extra: {} });
  assert.equal(result.metas.length, 1);
  assert.equal(result.metas[0].id, 'tt7587890');
});

test('catalog contains playback demonstration', async () => {
  const result = await addonInterface.get({ resource: 'catalog', type: 'movie', id: 'demonstracao', extra: {} });
  assert.equal(result.metas[0].id, 'tt1254207');
});

test('demo returns a playable stream description', async () => {
  const result = await addonInterface.get({ resource: 'stream', type: 'movie', id: 'tt1254207', extra: {} });
  assert.equal(result.streams.length, 1);
  assert.ok(result.streams[0].url.startsWith('https://'));
});

test('unconfigured The Rookie episode does not pretend to be available', () => {
  assert.deepEqual(getStreamsFor('series', 'tt7587890:1:1'), []);
});

test('rejects malformed stream addresses', () => {
  assert.equal(validStream({ url: 'javascript:alert(1)' }), null);
  assert.equal(validStream({ url: 'https://someone:password@site.test/a.mp4' }), null);
});

test('search excludes unrelated titles', async () => {
  const result = await addonInterface.get({ resource: 'catalog', type: 'series', id: 'series-ptbr', extra: { search: 'série inexistente' } });
  assert.deepEqual(result.metas, []);
});
