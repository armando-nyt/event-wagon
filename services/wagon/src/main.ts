import http from 'http';
import axios from 'axios';
import { z } from 'zod';
import { MesageProcessor, Subscriber, saveSubscriber } from './wagon';

const PORT = 3000;

async function relayMessage(subscriber: Subscriber, event: string) {
  try {
    console.log('sending post to sub', { subscriber, event });
    await axios.post(subscriber.webhook, event);
    return null;
  } catch (error) {
    return error as Error;
  }
}

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

const subscriberValidator = z.object({
  subscriberId: z.string(),
  webhook: z.string().url(),
});

const MessagePool = new MesageProcessor(relayMessage);

const server = http.createServer(async (req, res) => {
  const [url] = req.url?.split('?') || '';

  switch (url) {
    case '/':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('pong');
      return;

    case '/message': {
      if (req.method !== 'POST') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('bad request');
        return;
      }

      const { data, error } = await readBody(req);
      if (error || !data) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('malformed');
        return;
      }

      MessagePool.addMessage(data);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('ok');
      return;
    }

    case '/subscribe': {
      if (req.method !== 'POST') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('bad bad bad');
        return;
      }

      const { data, error } = await readBody(req);
      if (error || !data) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('malformed');
        return;
      }
      console.log(data);
      const result = subscriberValidator.safeParse(JSON.parse(data));
      if (!result.success) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('malformed data');
        return;
      }

      const saveResult = await saveSubscriber(result.data);
      if (saveResult.error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('internal error');
        return;
      }
      console.log({ saveResult: saveResult.data });
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
