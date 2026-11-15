# Stremio Dublados BR 🇧🇷

Addon independente para Stremio em português. **A V0.2 já implementa o recurso de reprodução `stream`**, mas **não fornece episódios de The Rookie** por conta própria: os streams exigem fontes autorizadas e válidas.

## O que funciona na V0.2

- Catálogo de **The Rookie** (`tt7587890`), incluindo os episódios disponíveis nos metadados Cinemeta das temporadas 1–8.
- Pesquisa por The Rookie / O Novato.
- Novo catálogo **Teste de reprodução (livre)**, com `Big Buck Bunny`, curta aberto do Blender que permite verificar o player do Stremio sem uma conta de streaming.
- Recurso `stream` implementado para retornar vídeos autorizados associados a episódios específicos, quando configurados em `streams.json`.
- Informação de idioma e qualidade nos nomes dos streams (fornecida por quem configura a fonte).

## Instalar no Windows

Requer [Node.js 18+](https://nodejs.org/), Git e Stremio Desktop.

```powershell
git clone https://github.com/raphaelsancho21-byte/Stremio-Dublados-BR.git
cd Stremio-Dublados-BR
npm install
npm test
npm start
```

Com o PowerShell ainda aberto, instale no Stremio a URL:

`http://127.0.0.1:7000/manifest.json`

Abra **Teste de reprodução (livre) → Big Buck Bunny** e tente reproduzir. A reprodução requer conexão com a internet; um player/cliente pode não aceitar todos os formatos.

## Configurar streams autorizados de um episódio

Edite o arquivo **`streams.json`**. Cada chave usa a identificação Stremio `tt7587890:temporada:episódio`, por exemplo `tt7587890:1:1`. Abaixo está **somente um exemplo do formato**, com URL fictícia que **não funciona** — substitua por uma fonte sua ou licenciada que permita reprodução direta.

```json
{
  "tt7587890:1:1": [
    {
      "name": "PT-BR • 1080p",
      "title": "Episódio 1 • áudio PT-BR verificado",
      "url": "https://exemplo-autorizado.invalid/episodio1.mp4"
    }
  ]
}
```

Guarde em `streams.json` e reinicie `npm start`. Apenas inclua links diretos HTTP(S) que você tem autorização para oferecer. O addon não extrai vídeos de plataformas pagas, não contorna DRM e **não garante dublagem** sem verificação da fonte. Não publique URLs privadas nem tokens de acesso no repositório público.

Sem links válidos configurados, clicar em *The Rookie* continuará mostrando o episódio, mas **não haverá stream fornecido por este addon**. Outras extensões instaladas no Stremio podem oferecer opções próprias, independentes deste projeto.

## Como funciona

| Endpoint | Função |
|---|---|
| `/manifest.json` | Recursos do addon |
| `/catalog/series/series-ptbr.json` | Catálogo da série |
| `/catalog/movie/demonstracao.json` | Catálogo do filme de teste |
| `/meta/series/tt7587890.json` | Episódios obtidos do Cinemeta |
| `/stream/movie/tt1254207.json` | Demonstração aberta |
| `/stream/series/tt7587890:1:1.json` | Fontes configuradas para S01E01 |

Para usar fora do notebook, hospede o servidor Node em um serviço HTTPS. O GitHub hospeda o código, não o servidor em execução.

## Licença

MIT. Projeto independente do Stremio e das distribuidoras.
