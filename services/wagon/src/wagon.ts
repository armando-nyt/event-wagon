import { ExecException, exec } from 'node:child_process';
import { resolve as pathResolve } from 'node:path';

const LIST_PATH = './subscribers.sh';
const TEMP_FILE = '/tmp/temp_subscribers.sh';
const EO_LIST_ANCHOR = 'NEW_SUBSCRIBER_HERE____NEW_WEBHOOK_HERE';
const SEPARATOR = '____'; // super unique separator

export type Subscriber = {
  subscriberId: string;
  webhook: string;
  // basic implementation we don't handle different topic or filter based on a event schema
};

function execPromisified(command: string) {
  return new Promise<{ data: string; error: null } | { data: null; error: ExecException }>(
    (resolve) =>
      exec(command, (err, data) => {
        if (!!err) return resolve({ data: null, error: err });
        resolve({ data, error: null });
      })
  );
}

export async function _readSubscribers(listPath: string) {
  const { data: rawList, error } = await execPromisified(pathResolve(__dirname, listPath));
  if (error) return { data: null, error };
  const decoded = decodeURL(rawList);
  return { data: JSON.parse(decoded) as Subscriber[], error: null };
}

export async function readSubscribers() {
  return _readSubscribers(LIST_PATH);
}

// cat "/Users/armando/Sketches/event-wagon/services/wagon/src/subscriber_test.sh" | sed 's/"NEW_SUBSCRIBER_HERENEW_WEBHOOK_HERE"/"someentry"\n"NEW_SUBSCRIBER_HERENEW_WEBHOOK_HERE"/g' \
// > /tmp/sometest.txt && cat /tmp/sometest.txt > subscriber_test.sh
export async function _saveSubscriber(listPath: string, { subscriberId, webhook }: Subscriber) {
  const escapedHook = encodeURL(webhook);
  const newSubEntry = subscriberId.concat(SEPARATOR, escapedHook);
  const file = pathResolve(__dirname, listPath);
  console.log({ file, newSubEntry });
  const userInsertion = await execPromisified(
    `cat ${file} | sed -e 's/"${EO_LIST_ANCHOR}"/"${newSubEntry}"\\\n"${EO_LIST_ANCHOR}"/g' > ${TEMP_FILE} && cat ${TEMP_FILE} > ${file}`
  );
  return userInsertion;
}

export async function saveSubscriber(sub: Subscriber) {
  return _saveSubscriber(LIST_PATH, sub);
}

export function encodeURL(url: string) {
  return url.replace(/\//g, `_SLASH_`);
}

export function decodeURL(url: string) {
  return url.replace(/_SLASH_/g, '/');
}

type ProcessHandler = (subscriber: Subscriber, event: string) => Promise<Error | null>;

export class MesageProcessor {
  // will be replaced with greenis at some point
  #buquet: string[];
  #errors: Error[];
  #timer_id: NodeJS.Timer;
  #processHandler: ProcessHandler;

  constructor(processHandler: ProcessHandler) {
    this.#buquet = [];
    this.#errors = [];
    this.#timer_id = setInterval(this.#processQueue.bind(this), 10000);
    this.#processHandler = processHandler;
  }

  async #processQueue() {
    const { data: subscribers, error } = await readSubscribers();
    if (error) {
      this.#errors.push(error);
      return;
    }

    for (let message of this.#buquet) {
      for (let sub of subscribers) {
        console.log('about to send message');
        const err = await this.#processHandler(sub, message);
        if (err) {
          this.#errors.push(err);
        }
      }
    }

    this.#buquet = [];
  }

  addMessage(message: string) {
    this.#buquet.push(message);
  }

  terminate() {
    clearInterval(this.#timer_id);
  }
}
