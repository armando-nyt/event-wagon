import { Subscriber, _readSubscribers, _saveSubscriber, decodeURL, encodeURL } from './wagon';

const LIST_PATH = './subscriber_test.sh';

it('should read the list of subscribers', async () => {
  const { data: list, error } = await _readSubscribers(LIST_PATH);
  expect(error).toBeNull();
  expect(list).toBeDefined();
  expect(Array.isArray(list)).toBeTruthy();
  console.log(list);
  expect(list[0]).toEqual({
    subscriber: 'super-unique-subscriber-id1',
    webhook: 'https://a-unique-domain.com/webhook1',
  });
  expect(list[1]).toEqual({
    subscriber: 'super-unique-subscriber-id2',
    webhook: 'https://a-unique-domain.com/webhook2',
  });
  expect(list[2]).toEqual({
    subscriber: 'super-unique-subscriber-id3',
    webhook: 'https://a-unique-domain.com/webhook3',
  });
});

it('should add to the list of subscribers', async () => {
  const newSub: Subscriber = {
    subscriberId: 'super-unique-subscriber-id',
    webhook: 'https://a-unique-domain.com/webhook',
  };
  const { data, error } = await _saveSubscriber(LIST_PATH, newSub);
  expect(error).toBeNull();
  expect(data).toBe('');
});

it('should escape forward slash in url', () => {
  const webhook = 'https://some-really-cool-service.com/webhook';
  expect(encodeURL(webhook)).toBe('https:_SLASH__SLASH_some-really-cool-service.com_SLASH_webhook');
});

it('should revert to forward slash in url', () => {
  const encoded = 'https:_SLASH__SLASH_some-really-cool-service.com_SLASH_webhook';
  const expected = 'https://some-really-cool-service.com/webhook';
  expect(decodeURL(encoded)).toBe(expected);
});
