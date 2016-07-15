import { expect } from 'chai';

import RAFT from 'src/index';

describe('addListener', () => {
  afterEach(() => {
    RAFT.reset();
  });

  it('raises an exception when called without arguments', () => {
    expect(RAFT.addListener).to.throw(TypeError);
  });

  it('raises an exception when called without callbacks', () => {
    expect(() => RAFT.addListener('mousemove')).to.throw();
  });

  it('accepts a single callback', () => {
    const fn = () => {};
    RAFT.addListener('mousemove', fn);

    const listener = RAFT.getListeners().get('mousemove');

    expect(listener).to.deep.equal({
      triggeredThisFrame: false,
      callbacks: [fn],
    });
  });

  it('accepts multiple callbacks', () => {
    const callbacks = [() => {}, () => {}];

    RAFT.addListener('scroll', ...callbacks);

    const listener = RAFT.getListeners().get('scroll');

    expect(listener).to.deep.equal({
      triggeredThisFrame: false,
      callbacks,
    });
  });

  it('accepts an array of callbacks', () => {
    const callbacks = [() => {}, () => {}];

    RAFT.addListener('resize', callbacks);
    const listener = RAFT.getListeners().get('resize');

    expect(listener).to.deep.equal({
      triggeredThisFrame: false,
      callbacks,
    });
  });

  it('adds a single listener when multiple callbacks are provided', () => {
    const callbacks = [() => {}, () => {}];

    RAFT.addListener('scroll', ...callbacks);

    const listeners = RAFT.getListeners();
    expect(listeners.size).to.equal(1);
  });

  it('starts the loop', () => {
    expect(RAFT.isRunning()).to.equal(false);

    RAFT.addListener('mousemove', () => {});

    expect(RAFT.isRunning()).to.equal(true);
  });

  it('is chainable, to add multiple listeners', () => {
    RAFT
      .addListener('scroll', () => {})
      .addListener('resize', () => {});

    const listeners = RAFT.getListeners();

    expect(listeners.size).to.equal(2);
  });
});
