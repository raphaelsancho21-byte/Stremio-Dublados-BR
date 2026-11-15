# Stremio Dublados BR 🇧🇷

Addon de catálogo para Stremio com foco em conteúdo em português do Brasil.

## V0.1

- Catálogo de séries, inicialmente com **The Rookie** (IMDb `tt7587890`).
- Listagem das temporadas **1 a 8** a partir de metadados públicos do Cinemeta, conforme disponibilidade da fonte.
- Pesquisa por `The Rookie` ou `O Novato`.
- Descrição em português.
- Sem links de vídeo não autorizados e sem promessa de disponibilidade de dublagem.

**Aviso:** este addon fornece **catálogo e metadados**, não os episódios ou streams. A presença da série na lista não garante áudio PT-BR. Para assistir, use um serviço que possua os direitos e ofereça a faixa de áudio desejada.

## Rodar no Windows

Instale o [Node.js 18+](https://nodejs.org/) e abra o PowerShell:

```powershell
git clone https://github.com/raphaelsancho21-byte/Stremio-Dublados-BR.git
cd Stremio-Dublados-BR
npm install
npm start
```

Com o servidor em execução, abra `http://127.0.0.1:7000/manifest.json` e instale a URL no Stremio (na seção **Addons / Instalar addon**). A instalação local funciona na mesma máquina; para outros dispositivos é necessário hospedar em **HTTPS**.

## Hospedagem

O GitHub armazena o código, mas **não executa** automaticamente este servidor Node.js. Para uso remoto, hospede em um serviço Node.js com HTTPS, configure o comando de inicialização `npm start` e a variável `PORT` conforme o serviço. Depois instale a URL `https://seu-dominio/manifest.json` no Stremio.

## Como funciona

- `/manifest.json`: informações do addon.
- `/catalog/series/series-ptbr.json`: lista de títulos.
- `/meta/series/tt7587890.json`: detalhes e episódios, obtidos de `v3-cinemeta.strem.io`.
- Nenhum recurso `stream` é fornecido por esta versão.

## Próximas etapas

Adicionar mais séries, permitir marcar dublagem **verificada** por plataforma e episódio, implementar cache persistente e testar hospedagem online.

## Licença

MIT. Este projeto é independente do Stremio, da ByteDance e das distribuidoras.
