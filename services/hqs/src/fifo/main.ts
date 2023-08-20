import http from 'http';
import { FifoQueue } from './fifo';
import { resolve } from 'path';

const PORT = 4000;
const queuePath = resolve(__dirname, './fifo.html');

const fifo = new FifoQueue(queuePath);

async function readBody(req: http.IncomingMessage) {
  return new Promise<{ data: string; error: null } | { data: null; error: Error }>((resolve) => {
    let rawData = '';
    req
      .on('data', (chunk) => {
        rawData += chunk;
      })
      .on('end', () => {
        resolve({ data: rawData, error: null });
      })
      .on('error', (err) => resolve({ data: null, error: err }));
  });
}

const server = http.createServer(async (req, res) => {
  const [url] = req.url?.split('?') || '';

  switch (url) {
    case '/':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      console.log('pong');
      res.end('pong');
      return;

    case '/webhook': {
      if (req.method !== 'POST') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('bad request');
        return;
      }
      console.log('about to parse json');
      const { data, error } = await readBody(req);
      if (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('malformed request');
        return;
      }
      console.log({ data });
      const jsonfifiedData = JSON.parse(data);
      fifo.enqueueItem(jsonfifiedData);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('ok');
      return;
    }

    default:
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('default');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
