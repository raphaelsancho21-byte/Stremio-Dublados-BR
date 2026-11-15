'use strict';

const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const ROOKIE_ID = 'tt7587890';
const manifest = {
  id: 'br.dublados.stremio',
  version: '0.1.0',
  name: 'Stremio Dublados BR',
  description: 'Catálogo em português com foco em dublagem PT-BR. Não fornece streams nem contorna assinaturas.',
  resources: ['catalog', 'meta'],
  types: ['series'],
  idPrefixes: ['tt'],
  catalogs: [{
    type: 'series',
    id: 'series-ptbr',
    name: 'Séries em PT-BR',
    extra: [{ name: 'search', isRequired: false }]
  }]
};

const rookiePreview = {
  id: ROOKIE_ID,
  type: 'series',
  name: 'The Rookie',
  poster: 'https://images.metahub.space/poster/medium/' + ROOKIE_ID + '/img',
  description: 'John Nolan recomeça a vida como policial em Los Angeles. Verifique áudio em português do Brasil no serviço escolhido.',
  releaseInfo: '2018–'
};

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id, extra = {} }) => {
  if (type !== 'series' || id !== 'series-ptbr') return { metas: [] };
  const search = String(extra.search || '').trim().toLocaleLowerCase('pt-BR');
  if (search && !('the rookie'.includes(search) || 'o novato'.includes(search))) {
    return { metas: [] };
  }
  return { metas: [rookiePreview], cacheMaxAge: 3600 };
});

async function fetchCinemeta() {
  const url = 'https://v3-cinemeta.strem.io/meta/series/' + ROOKIE_ID + '.json';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error('Cinemeta HTTP ' + response.status);
    const payload = await response.json();
    if (!payload || !payload.meta || payload.meta.id !== ROOKIE_ID) {
      throw new Error('Resposta inesperada da fonte de metadados');
    }
    return payload.meta;
  } finally {
    clearTimeout(timeout);
  }
}

builder.defineMetaHandler(async ({ type, id }) => {
  if (type !== 'series' || id !== ROOKIE_ID) return { meta: null };
  try {
    const original = await fetchCinemeta();
    const episodes = Array.isArray(original.videos)
      ? original.videos.filter(v => Number(v.season) >= 1 && Number(v.season) <= 8)
      : [];
    return {
      meta: {
        ...original,
        id: ROOKIE_ID,
        type: 'series',
        name: 'The Rookie',
        description: 'John Nolan começa uma nova carreira na polícia de Los Angeles. Catálogo PT-BR: a disponibilidade de dublagem varia por plataforma e episódio.',
        videos: episodes
      },
      cacheMaxAge: 3600
    };
  } catch (error) {
    console.warn('[Cinemeta] Metadados indisponíveis:', error.message);
    return { meta: { ...rookiePreview, videos: [] }, cacheMaxAge: 300 };
  }
});

const port = Number(process.env.PORT) || 7000;
if (require.main === module) {
  serveHTTP(builder.getInterface(), { port });
  console.log('Stremio Dublados BR disponível em http://127.0.0.1:' + port + '/manifest.json');
}

module.exports = { manifest, addonInterface: builder.getInterface() };
