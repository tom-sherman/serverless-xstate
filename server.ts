import * as http from 'http';

import {
  HttpRequest,
  toNodeRequestListener,
  OK,
  BAD_REQUEST,
} from 'http4ts/dist/node';
import { createInterpreter } from './interpreter';
import { countMachine } from './machine';
import { createFileStorage } from './storage';

async function handler(req: HttpRequest) {
  const id = new URL(req.url, `http://${hostname}:${port}`).searchParams.get(
    'id'
  );
  if (!id) {
    return BAD_REQUEST({
      body: JSON.stringify({ message: 'Must provide an ID' }),
    });
  }
  const storage = createFileStorage('store.json');
  const interpreter = createInterpreter(id, countMachine, storage);
  const state = await interpreter.settleMachine(
    JSON.parse(await req.body.asString())
  );

  return OK({
    body: JSON.stringify({ hello: 'world', body: state }),
    headers: { 'content-type': 'application/json' },
  });
}

const server = http.createServer(toNodeRequestListener(handler));

const hostname = '127.0.0.1';
const port = 3000;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
