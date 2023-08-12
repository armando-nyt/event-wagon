import { parse, Node } from 'node-html-parser';
import { readFile, writeFile } from 'node:fs/promises';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

export class FifoQueue {
  location: string;
  #queueId: string;

  constructor(location: string) {
    this.#queueId = 'foooofiiii';
    this.location = location;
    const err = this.#createQueue();
    if (err) console.error(err);
  }

  #createQueue() {
    const base = `<!DOCTYPE html>
    <body>
    <ul id=${this.#queueId}></ul>
    </body>`;

    try {
      if (existsSync(this.location)) throw new Error('file already exists');
      writeFileSync(this.location, base);
      return null;
    } catch (err) {
      return err as Error;
    }
  }

  async #getQueue() {
    try {
      const file = await readFile(this.location);
      return { data: file.toString(), error: null };
    } catch (error) {
      const castError = error as Error;
      return { data: null, error: castError };
    }
  }

  async #enqueueItem(item: HTMLLIElement) {
    try {
      const { data: currQueue, error } = await this.#getQueue();
      if (error) throw error;
      const dom = new JSDOM(currQueue);
      const parsedQueue = dom.window.document.getElementById(this.#queueId);
      if (!parsedQueue) throw new Error('no queue found');
      parsedQueue.appendChild(item);
      await writeFile(this.location, dom.window.document.documentElement.outerHTML);
      return null;
    } catch (error) {
      return error as Error;
    }
  }

  async enqueueItem(item: Record<string, string>) {
    const dom = new JSDOM('');
    const newItem = dom.window.document.createElement('li');
    Object.entries(item).forEach(([key, value]) => {
      newItem.dataset[key] = value;
    });
    const err = await this.#enqueueItem(newItem);
    if (err) return err;

    return null;
  }

  async dequeueItem() {
    try {
      const { data: currQueue, error } = await this.#getQueue();
      if (error) throw error;

      const dom = new JSDOM(currQueue);
      const parsedQueue = dom.window.document.getElementById(this.#queueId);
      const dequeued = parsedQueue?.getElementsByTagName('li')[0];
      if (!dequeued) throw new Error('queue is empty');
      parsedQueue.removeChild(dequeued);
      await writeFile(this.location, dom.window.document.documentElement.outerHTML);

      const data = Object.entries(dequeued.dataset).reduce<{ [k: string]: string }>(
        (cleanObject, [key, value]) => {
          if (!!value) {
            cleanObject[key] = value;
          }
          return cleanObject;
        },
        {}
      );

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  }
}
