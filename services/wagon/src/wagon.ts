import { ExecException, exec } from 'node:child_process';
import { resolve as pathResolve } from 'node:path';

const LIST_PATH = './subscribers.sh';

function execPromisified(command) {
  return new Promise<{ data: string; error: null } | { data: null; error: ExecException }>(
    (resolve) =>
      exec(command, (err, data) => {
        if (!!err) return resolve({ data: null, error: err });
        resolve({ data, error: null });
      })
  );
}

export async function _readSubscribers(listPath: string) {
  const { data: rawList, error } = await await execPromisified(pathResolve(__dirname, listPath));
  if (error) return { data: null, error };
  return { data: JSON.parse(rawList), error: null };
}

export async function readSubscribers() {
  return _readSubscribers(LIST_PATH);
}
