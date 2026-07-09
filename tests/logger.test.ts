import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { logger } from '../lib/logger';

test('logger.log calls console.log with arguments', () => {
  const logMock = mock.method(console, 'log', () => {});
  logger.log('hello', 'world', 42);
  assert.equal(logMock.mock.callCount(), 1);
  assert.deepEqual(logMock.mock.calls[0].arguments, ['hello', 'world', 42]);
  logMock.mock.restore();
});

test('logger.error calls console.error with arguments', () => {
  const errorMock = mock.method(console, 'error', () => {});
  logger.error('an error', new Error('boom'));
  assert.equal(errorMock.mock.callCount(), 1);
  assert.equal(errorMock.mock.calls[0].arguments[0], 'an error');
  errorMock.mock.restore();
});

test('logger.warn calls console.warn with arguments', () => {
  const warnMock = mock.method(console, 'warn', () => {});
  logger.warn('warning message');
  assert.equal(warnMock.mock.callCount(), 1);
  assert.deepEqual(warnMock.mock.calls[0].arguments, ['warning message']);
  warnMock.mock.restore();
});

test('logger.info calls console.info with arguments', () => {
  const infoMock = mock.method(console, 'info', () => {});
  logger.info('info message', { key: 'value' });
  assert.equal(infoMock.mock.callCount(), 1);
  assert.deepEqual(infoMock.mock.calls[0].arguments, ['info message', { key: 'value' }]);
  infoMock.mock.restore();
});

test('logger is a plain object with the four expected methods', () => {
  assert.equal(typeof logger.log, 'function');
  assert.equal(typeof logger.error, 'function');
  assert.equal(typeof logger.warn, 'function');
  assert.equal(typeof logger.info, 'function');
});
