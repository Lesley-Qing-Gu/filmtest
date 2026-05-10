import fs from 'fs';
import path from 'path';

export function articlesApi() {
  return {
    name: 'articles-api',
    configureServer(server) {
      server.middlewares.use('/api/articles', async (req, res) => {
        const filePath = path.resolve(__dirname, 'public/articles.json');

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
    }
  };
}
