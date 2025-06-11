const fs = require('fs');
const os = require('os');
const path = require('path');
const config = require('../lib/config');
const PomodoroSession = require('../lib/session');

let History;
let tmpDir;

beforeEach(() => {
  jest.resetModules();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pmdclock-test-'));
  config.set('db', path.join(tmpDir, 'db.dat'));
  History = require('../lib/history');
});

afterEach(() => {
  if (PomodoroSession.thereAreActual()) {
    PomodoroSession.cancel();
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('save and list sessions', () => {
  const session = PomodoroSession.start('test');
  PomodoroSession.finish();
  const history = new History();
  history.save(session, false);
  expect(history.list().length).toBe(1);
});

test('clear removes history', () => {
  const session = PomodoroSession.start('t');
  PomodoroSession.finish();
  const history = new History();
  history.save(session, false);
  history.clear(false);
  expect(history.list().length).toBe(0);
});
