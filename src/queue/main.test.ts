import { resolve } from 'node:path';
import { FifoQueue } from './main';
import { readFile } from 'node:fs/promises';
import { unlinkSync } from 'node:fs';
import parse from 'node-html-parser';

describe('FifoQueue', () => {
  const testFile = resolve(__dirname, 'test-queue.html');

  afterEach(() => {
    unlinkSync(testFile);
  });

  it('create a new queue', async () => {
    const queue = new FifoQueue(testFile);

    const expectedQueue = await readFile(testFile);
    expect(expectedQueue.toString()).toContain('<ul id=foooofiiii>');
  });

  it('adds an item to the queue', async () => {
    const queue = new FifoQueue(testFile);
    await queue.addItem({ id: 'test-id', foo: 'bar' });
    const expectedQueue = await readFile(testFile);
    const parsedQueue = parse(expectedQueue.toString());
    const items = parsedQueue.getElementsByTagName('li');
    expect(items[0]).toBeDefined();
    console.log(parsedQueue);
    expect(items[0].getAttribute('data-foo')).toBe('bar');
  });
});
