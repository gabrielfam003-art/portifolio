# Portfólio — Gabriel Carvalho

Site estático (HTML + CSS + JS puro), bilíngue PT/EN, fundo branco com detalhes em dourado e cinza claro. Não precisa instalar nada: dê dois cliques em `index.html` para ver no navegador.

## Arquivos
- `index.html` — textos e estrutura (é aqui que você edita o conteúdo)
- `style.css` — visual. As cores ficam no começo do arquivo, em `:root`
- `circuit.js` — fundo animado de circuito
- `main.js` — interações (idioma, abas, demo do display, formulário, rolagem suave). Seu e-mail fica no topo, em `EMAIL`
- `assets/foto.webp` — sua foto
- `assets/qr.svg` — QR code do final da página (hoje abre o seu LinkedIn)
- `curriculo-gabriel-carvalho.pdf` — arquivo do botão "Baixar currículo"

## Como editar o conteúdo
- Cada texto tem duas versões lado a lado: `<span class="pt">...</span><span class="en">...</span>`. Edite as duas.
- **Novo projeto:** abra `index.html`, procure por `MODELO` (dentro de `#panel-projetos`). Copie o bloco `<article class="panel project">`, cole logo abaixo do último projeto (fora do comentário) e troque nome, descrição, tecnologias e link. Para trocar o ícone, mude `#i-code` por outro da lista no topo do arquivo (`i-cpu`, `i-db`, `i-globe`, `i-layout`...).
- **Remover projeto:** apague o bloco `<article ...> ... </article>` inteiro.
- **Links escondidos** (GitHub, Wokwi, certificados): remova o atributo `hidden` e coloque o endereço em `href`.
- **Novo curso:** em `#panel-formacao`, copie uma linha `<div class="row">` e edite.
- **Nova habilidade:** em `#panel-habilidades`, copie um bloco `<article class="panel skill">`.
- **Certificados em PDF:** crie a pasta `certificados/`, coloque os arquivos e aponte o `href`.

## Trocar foto, QR code e currículo
- **Foto:** substitua `assets/foto.webp` por outra imagem 3:4 (ex.: 780×1040) com o mesmo nome.
- **QR code:** gere um QR (qualquer gerador gratuito) e salve como `assets/qr.svg`. Depois de publicar o site, vale trocar para o endereço do portfólio.
- **Currículo:** substitua o PDF mantendo o nome, ou mude o `href` do botão em `index.html`.

## Cores
No começo de `style.css`: `--ink` (fundo, branco), `--gold` (dourado), `--steel` (cinza dos textos secundários) e `--edge` (bordas em cinza claro).

## Publicar de graça
**Vercel:** vercel.com → *Add New → Project* → envie esta pasta (ou ligue a um repositório do GitHub). O endereço fica `nome.vercel.app`.

**GitHub Pages:** crie um repositório público, envie os arquivos e ative em *Settings → Pages*.

As fontes (Chakra Petch e IBM Plex Sans) são carregadas do Google Fonts; precisa de internet para aparecerem como no desenho.
