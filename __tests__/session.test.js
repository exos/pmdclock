const PomodoroSession = require('../lib/session');

afterEach(() => {
  if (PomodoroSession.thereAreActual()) {
    PomodoroSession.cancel();
  }
});

test('start creates a running session', () => {
  const session = PomodoroSession.start('test');
  expect(session._name).toBe('test');
  expect(session._status).toBe(session.STATUS_RUNNING);
  expect(PomodoroSession.thereAreActual()).toBe(session);
});

test('starting twice throws error', () => {
  PomodoroSession.start('first');
  expect(() => PomodoroSession.start('second')).toThrow('There are an actual task');
});

test('finish ends the session', () => {
  const session = PomodoroSession.start('test');
  PomodoroSession.finish();
  expect(session._status).toBe(session.STATUS_FINISHED);
  expect(PomodoroSession.thereAreActual()).toBe(false);
});

test('cancel aborts the session', () => {
  const session = PomodoroSession.start('test');
  PomodoroSession.cancel();
  expect(session._active).toBe(false);
  expect(PomodoroSession.thereAreActual()).toBe(false);
});
