import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function articlesApi() {
  return {
    name: 'articles-api',
    configureServer(server) {
      // Articles API
      server.middlewares.use('/api/articles', async (req, res) => {
        const filePath = path.resolve('public/articles.json');

        if (req.method === 'GET') {
          const data = fs.readFileSync(filePath, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            fs.writeFileSync(filePath, body, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          });
        } else {
          res.statusCode = 405;
          res.end();
        }
      });

      // Image upload API
      server.middlewares.use('/api/upload', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }

        const imagesDir = path.resolve('public/images');
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(Buffer.from(chunk)));
        req.on('end', () => {
          const buffer = Buffer.concat(chunks);
          // Parse multipart form data manually
          const boundary = req.headers['content-type']?.split('boundary=')[1];
          if (!boundary) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'No boundary' }));
            return;
          }

          const parts = buffer.toString('binary').split('--' + boundary);
          for (const part of parts) {
            const filenameMatch = part.match(/filename="(.+?)"/);
            if (!filenameMatch) continue;

            const originalName = filenameMatch[1];
            const ext = path.extname(originalName);
            const fileName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;

            const headerEnd = part.indexOf('\r\n\r\n');
            if (headerEnd === -1) continue;

            const bodyStart = headerEnd + 4;
            const bodyEnd = part.lastIndexOf('\r\n');
            const fileData = Buffer.from(part.slice(bodyStart, bodyEnd), 'binary');

            fs.writeFileSync(path.join(imagesDir, fileName), fileData);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ url: '/images/' + fileName, fileName }));
            return;
          }

          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'No file found' }));
        });
      });

      // List images API
      server.middlewares.use('/api/images', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end();
          return;
        }

        const imagesDir = path.resolve('public/images');
        if (!fs.existsSync(imagesDir)) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify([]));
          return;
        }

        const files = fs.readdirSync(imagesDir)
          .filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
          .map(f => ({ name: f, url: '/images/' + f }));

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(files));
      });
    }
  };
}
