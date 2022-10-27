import User, { isSnoozeOn } from '../classes/User';

// isSnoozeOn()
// critical values: snooze on, snooze off
it('isSnoozeOn() Test 1: Notifications on should return true', () => {
  const user = new User('name', 'ID', true);
  expect(isSnoozeOn(user)).toBe(true);
});

it('isSnoozeOn() Tets 2: Notifications off should return false', () => {
  const user = new User('name', 'ID', true);
  expect(isSnoozeOn(user)).toBe(false);
});
