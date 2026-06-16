/* Servidor do Nossa História
   - Serve os arquivos estáticos do site
   - POST /api/p      → salva os dados do presente e devolve um id curto
   - GET  /api/p/:id  → devolve os dados do presente
   Os presentes ficam em DATA_DIR (padrão /data) — monte um volume aí no EasyPanel. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 80;
const DATA_DIR = process.env.DATA_DIR || '/data';
const MAX_BODY = 64 * 1024; // 64KB por presente
const ID_RE = /^[A-Za-z0-9]{6,12}$/;

fs.mkdirSync(DATA_DIR, { recursive: true });

const STATIC = {
  '/':                            ['index.html', 'text/html; charset=utf-8'],
  '/index.html':                  ['index.html', 'text/html; charset=utf-8'],
  '/og-image.png':                ['og-image.png', 'image/png'],
  '/robots.txt':                  ['robots.txt', 'text/plain; charset=utf-8'],
  '/sitemap.xml':                 ['sitemap.xml', 'application/xml; charset=utf-8'],
  '/google82036a0e3ac7582a.html': ['google82036a0e3ac7582a.html', 'text/html; charset=utf-8']
};

const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function novoId() {
  let id = '';
  for (const b of crypto.randomBytes(7)) id += ABC[b % ABC.length];
  return id;
}

function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function salvarPresente(req, res) {
  let body = '';
  let tamanho = 0;
  req.on('data', chunk => {
    tamanho += chunk.length;
    if (tamanho > MAX_BODY) { req.destroy(); return; }
    body += chunk;
  });
  req.on('end', () => {
    let data;
    try { data = JSON.parse(body); } catch { return json(res, 400, { erro: 'JSON inválido' }); }
    if (!data || typeof data !== 'object' || !data.de || !data.para || !Array.isArray(data.quiz)) {
      return json(res, 400, { erro: 'Dados do presente incompletos' });
    }
    let id, arquivo;
    do {
      id = novoId();
      arquivo = path.join(DATA_DIR, id + '.json');
    } while (fs.existsSync(arquivo));
    fs.writeFile(arquivo, JSON.stringify(data), err => {
      if (err) return json(res, 500, { erro: 'Falha ao salvar' });
      json(res, 201, { id });
    });
  });
}

function buscarPresente(res, id) {
  if (!ID_RE.test(id)) return json(res, 400, { erro: 'Id inválido' });
  fs.readFile(path.join(DATA_DIR, id + '.json'), 'utf8', (err, conteudo) => {
    if (err) return json(res, 404, { erro: 'Presente não encontrado' });
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(conteudo);
  });
}

http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/api/p' && req.method === 'POST') return salvarPresente(req, res);

  const m = url.match(/^\/api\/p\/([^/]+)$/);
  if (m && req.method === 'GET') return buscarPresente(res, m[1]);

  const st = STATIC[url];
  if (st && (req.method === 'GET' || req.method === 'HEAD')) {
    const caminho = path.join(__dirname, st[0]);
    fs.readFile(caminho, (err, conteudo) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': st[1], 'Cache-Control': st[0] === 'index.html' ? 'no-cache' : 'public, max-age=86400' });
      res.end(req.method === 'HEAD' ? undefined : conteudo);
    });
    return;
  }

  // qualquer outra rota volta para a página (o hash decide o que mostrar)
  res.writeHead(302, { Location: '/' });
  res.end();
}).listen(PORT, () => console.log(`Nossa História rodando na porta ${PORT}, dados em ${DATA_DIR}`));
