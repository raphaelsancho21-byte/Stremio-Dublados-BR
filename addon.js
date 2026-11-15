'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const ROOKIE_ID = 'tt7587890';
const DEMO_ID = 'tt1254207';
const STREAMS_FILE = process.env.STREAMS_FILE || path.join(__dirname, 'streams.json');

const manifest = {
  id: 'br.dublados.stremio',
  version: '0.2.0',
  name: 'Stremio Dublados BR',
  description: 'Catálogo PT-BR com reprodução de vídeos autorizados e teste de player. Episódios de séries só aparecem quando há fonte configurada.',
  resources: ['catalog', 'meta', 'stream'],
  types: ['series', 'movie'],
  idPrefixes: ['tt'],
  catalogs: [
    { type: 'series', id: 'series-ptbr', name: 'Séries em PT-BR', extra: [{ name: 'search', isRequired: false }] },
    { type: 'movie', id: 'demonstracao', name: 'Teste de reprodução (livre)' }
  ]
};

const rookiePreview = {
  id: ROOKIE_ID,
  type: 'series',
  name: 'The Rookie',
  poster: 'https://images.metahub.space/poster/medium/' + ROOKIE_ID + '/img',
  description: 'John Nolan recomeça a vida como policial em Los Angeles. A dublagem PT-BR depende da fonte.',
  releaseInfo: '2018–'
};

const demoPreview = {
  id: DEMO_ID,
  type: 'movie',
  name: 'Big Buck Bunny — Teste gratuito',
  poster: 'https://images.metahub.space/poster/medium/' + DEMO_ID + '/img',
  description: 'Curta aberto do Blender. Usado apenas para verificar a reprodução no Stremio.',
  releaseInfo: '2008'
};

const DEMO_STREAM = {
  name: 'Teste aberto',
  title: 'Big Buck Bunny | Filme de demonstração | Áudio original',
  url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
};

function loadUserStreams() {
  try {
    const parsed = JSON.parse(fs.readFileSync(STREAMS_FILE, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn('[Fontes] Falha ao ler streams.json:', error.message);
    return {};
  }
}

function validStream(entry) {
  if (!entry || typeof entry !== 'object') return null;
  if (typeof entry.url !== 'string') return null;
  let url;
  try { url = new URL(entry.url); } catch { return null; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (url.username || url.password) return null;
  return {
    url: url.toString(),
    name: String(entry.name || 'Fonte autorizada').slice(0, 70),
    title: String(entry.title || 'Fonte de vídeo configurada').slice(0, 160)
  };
}

function getStreamsFor(type, id) {
  if (type === 'movie' && id === DEMO_ID) return [DEMO_STREAM];
  if (type !== 'series' || !/^tt7587890:[1-8]:[1-9]\d*$/.test(id)) return [];
  const userSources = loadUserStreams();
  const entries = userSources[id];
  if (!Array.isArray(entries)) return [];
  return entries.slice(0, 10).map(validStream).filter(Boolean);
}

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id, extra = {} }) => {
  if (type === 'movie' && id === 'demonstracao') return { metas: [demoPreview] };
  if (type !== 'series' || id !== 'series-ptbr') return { metas: [] };
  const search = String(extra.search || '').trim().toLocaleLowerCase('pt-BR');
  if (search && !('the rookie'.includes(search) || 'o novato'.includes(search))) return { metas: [] };
  return { metas: [rookiePreview] };
});

async function fetchCinemeta() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch('https://v3-cinemeta.strem.io/meta/series/' + ROOKIE_ID + '.json', { signal: controller.signal });
    if (!response.ok) throw new Error('Cinemeta HTTP ' + response.status);
    const payload = await response.json();
    if (!payload?.meta || payload.meta.id !== ROOKIE_ID) throw new Error('Resposta inválida');
    return payload.meta;
  } finally { clearTimeout(timeout); }
}

builder.defineMetaHandler(async ({ type, id }) => {
  if (type === 'movie' && id === DEMO_ID) return { meta: demoPreview };
  if (type !== 'series' || id !== ROOKIE_ID) return { meta: null };
  try {
    const original = await fetchCinemeta();
    const videos = Array.isArray(original.videos)
      ? original.videos.filter(v => Number(v.season) >= 1 && Number(v.season) <= 8)
      : [];
    return {
      meta: {
        ...original,
        id: ROOKIE_ID,
        type: 'series',
        name: 'The Rookie',
        description: 'John Nolan ingressa na polícia de Los Angeles. A disponibilidade de episódios dublados varia conforme as fontes autorizadas configuradas.',
        videos
      },
      cacheMaxAge: 3600
    };
  } catch (error) {
    console.warn('[Cinemeta]', error.message);
    return { meta: { ...rookiePreview, videos: [] }, cacheMaxAge: 300 };
  }
});

builder.defineStreamHandler(async ({ type, id }) => ({
  streams: getStreamsFor(type, id),
  cacheMaxAge: 60
}));

const addonInterface = builder.getInterface();
if (require.main === module) {
  const port = Number(process.env.PORT) || 7000;
  serveHTTP(addonInterface, { port });
  console.log('Addon: http://127.0.0.1:' + port + '/manifest.json');
}

module.exports = { manifest, addonInterface, getStreamsFor, validStream };
