/* eslint-disable no-console */
import { expect } from 'chai';
import sinon from 'sinon';

import RAFT from 'src/index';

describe('removeListener', () => {
  before(() => {
    sinon.spy(console, 'warn');
  });

  after(() => {
    console.warn.restore();
  });

  afterEach(() => {
    RAFT
      .reset()
      .addListener('scroll', () => {});

    console.warn.reset();
  });

  it('raises an exception when called without arguments', () => {
    expect(RAFT.removeListener).to.throw(TypeError);
  });

  it('logs a warning when the listener provided does not exist', () => {
    expect(console.warn.called).to.equal(false);
    RAFT.removeListener('yadda-yadda');
    expect(console.warn.called).to.equal(true);
  });

  it('removes the listener successfully, and stops the loop', () => {
    expect(RAFT.getListeners().size).to.equal(1);
    expect(RAFT.isRunning()).to.equal(true);

    RAFT.removeListener('scroll');

    expect(RAFT.getListeners().size).to.equal(0);
    expect(RAFT.isRunning()).to.equal(false);
  });
});
