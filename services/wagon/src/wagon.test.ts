import { foo } from './wagon';

it('should foobar everything', () => {
  expect(foo()).toBe('bar');
});
