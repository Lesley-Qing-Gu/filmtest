import fs from 'fs';
import path from 'path';

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
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const contentType = req.headers['content-type'] || '';
          const boundaryMatch = contentType.match(/boundary=(.+)/);
          if (!boundaryMatch) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'No boundary found' }));
            return;
          }

          const boundary = boundaryMatch[1];
          const boundaryBuffer = Buffer.from('--' + boundary);

          // Find parts by splitting on boundary
          const parts: Buffer[] = [];
          let start = 0;
          while (true) {
            const idx = buffer.indexOf(boundaryBuffer, start);
            if (idx === -1) break;
            if (start > 0) {
              // Remove leading \r\n and trailing \r\n from part
              parts.push(buffer.slice(start, idx - 2));
            }
            start = idx + boundaryBuffer.length + 2; // skip boundary + \r\n
          }

          for (const part of parts) {
            // Find header/body separator: \r\n\r\n
            const headerEnd = part.indexOf('\r\n\r\n');
            if (headerEnd === -1) continue;

            const header = part.slice(0, headerEnd).toString('utf-8');
            const filenameMatch = header.match(/filename="(.+?)"/);
            if (!filenameMatch) continue;

            const originalName = filenameMatch[1];
            const ext = path.extname(originalName).toLowerCase();
            const fileName = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;
            const fileData = part.slice(headerEnd + 4);

            fs.writeFileSync(path.join(imagesDir, fileName), fileData);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ url: '/images/' + fileName, fileName }));
            return;
          }

          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'No file found in upload' }));
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
