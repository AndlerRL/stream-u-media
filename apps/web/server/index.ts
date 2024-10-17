import { createServer } from 'http';
import next from 'next';
import { parse } from 'url';
import { Streamer } from './streamer.server';

const dev = process.env.NODE_ENV !== 'production';
const app = next({
  dev,
  customServer: true,
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  new Streamer({ server });

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});

export * from './streamer.server';

