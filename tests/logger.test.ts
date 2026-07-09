import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { logger } from '../lib/logger';

test('logger output methods', () => {
  const logMock = mock.method(console, 'log', () => {});
  const errorMock = mock.method(console, 'error', () => {});
  const warnMock = mock.method(console, 'warn', () => {});
  const infoMock = mock.method(console, 'info', () => {});

  logger.log('test log');
  assert.equal(logMock.mock.callCount(), 1);
  assert.deepEqual(logMock.mock.calls[0].arguments, ['test log']);

  logger.error('test error');
  assert.equal(errorMock.mock.callCount(), 1);
  assert.deepEqual(errorMock.mock.calls[0].arguments, ['test error']);

  logger.warn('test warn');
  assert.equal(warnMock.mock.callCount(), 1);
  assert.deepEqual(warnMock.mock.calls[0].arguments, ['test warn']);

  logger.info('test info');
  assert.equal(infoMock.mock.callCount(), 1);
  assert.deepEqual(infoMock.mock.calls[0].arguments, ['test info']);

  logMock.mock.restore();
  errorMock.mock.restore();
  warnMock.mock.restore();
  infoMock.mock.restore();
});
