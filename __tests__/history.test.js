jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    lstatSync: jest.fn(() => ({ isDirectory: () => true })),
    mkdirSync: jest.fn(),
  };
});

jest.mock('node-storage', () => {
  return jest.fn().mockImplementation(() => {
    const store = {};
    return {
      store,
      get: jest.fn(key => store[key]),
      put: jest.fn((key, value) => { store[key] = value; }),
      remove: jest.fn(key => { delete store[key]; }),
    };
  });
});

const config = require('../lib/config');
const PomodoroSession = require('../lib/session');

let History;

beforeEach(() => {
  jest.resetModules();
  config.set('db', '/tmp/pmdclock-test.db');
  History = require('../lib/history');
});

afterEach(() => {
  if (PomodoroSession.thereAreActual()) {
    PomodoroSession.cancel();
  }
});

test('save and list sessions', () => {
  const Storage = require('node-storage');
  const session = PomodoroSession.start('test');
  PomodoroSession.finish();
  const history = new History();
  history.save(session);
  expect(history.list().length).toBe(1);
  const store = Storage.mock.results[0].value.store;
  expect(store.tomatos).toHaveLength(1);
});

test('clear removes history', () => {
  const Storage = require('node-storage');
  const session = PomodoroSession.start('t');
  PomodoroSession.finish();
  const history = new History();
  history.save(session);
  history.clear();
  expect(history.list().length).toBe(0);
  const store = Storage.mock.results[0].value.store;
  expect(store.tomatos).toHaveLength(0);
});
