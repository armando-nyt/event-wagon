import { _readSubscribers } from './wagon';

const LIST_PATH = './subscriber_test.sh';

it('should read the list of subscribers', async () => {
  const { data: list, error } = await _readSubscribers(LIST_PATH);
  expect(error).toBeNull();
  expect(list).toBeDefined();
  expect(Array.isArray(list)).toBeTruthy();
  expect(list[0]).toEqual({ subscriber: 'FOO', webhook: 'BAR' });
  expect(list[1]).toEqual({ subscriber: 'BAR', webhook: 'BAZ' });
  expect(list[2]).toEqual({ subscriber: 'BAZ', webhook: 'WHATEVER' });
});
