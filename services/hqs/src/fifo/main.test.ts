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
    await queue.enqueueItem({ id: 'test-id', foo: 'bar' });

    const expectedQueue = await readFile(testFile);
    const parsedQueue = parse(expectedQueue.toString());
    const items = parsedQueue.getElementsByTagName('li');
    expect(items[0]).toBeDefined();
    expect(items[0].getAttribute('data-foo')).toBe('bar');
  });

  it('removes an item to the queue', async () => {
    const queue = new FifoQueue(testFile);
    await queue.enqueueItem({ id: 'test-id', bar: 'baz' });
    await queue.enqueueItem({ id: 'test-some-other-id', baz: 'no clue what comes next' });

    const { data: firstItem, error: firstErr } = await queue.dequeueItem();
    const { data: secondItem, error: secondErr } = await queue.dequeueItem();
    expect(firstErr).toBeNull();
    expect(firstItem).toBeDefined();
    expect(firstItem?.bar).toBe('baz');
    expect(firstItem?.baz).not.toBe('no clue what comes next');
    expect(secondErr).toBeNull();
    expect(secondItem).toBeDefined();
    expect(secondItem?.baz).toBe('no clue what comes next');
    expect(secondItem?.bar).not.toBe('baz');
  });
});
