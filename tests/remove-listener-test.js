/* eslint-disable no-console */
import { expect } from 'chai';
import sinon from 'sinon';

import RAFT from 'src/index';

describe('removeListener', () => {
  before(() => {
    sinon.stub(console, 'warn');
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

  it('does not stop the loop if other listeners remain', () => {
    RAFT
      .addListener('mousemove', () => {})
      .removeListener('scroll');

    expect(RAFT.getListeners().size).to.equal(1);
    expect(RAFT.isRunning()).to.equal(true);
  });

  it('is chainable', () => {
    RAFT
      .addListener('mousemove', () => {})
      .removeListener('scroll')
      .removeListener('mousemove');

    expect(RAFT.getListeners().size).to.equal(0);
  });
});
