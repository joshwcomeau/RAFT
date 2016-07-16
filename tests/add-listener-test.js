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

    expect(listener).to.deep.equal({ callbacks: [fn] });
  });

  it('accepts multiple callbacks', () => {
    const callbacks = [() => {}, () => {}];

    RAFT.addListener('scroll', ...callbacks);

    const listener = RAFT.getListeners().get('scroll');

    expect(listener).to.deep.equal({ callbacks });
  });

  it('accepts an array of callbacks', () => {
    const callbacks = [() => {}, () => {}];

    RAFT.addListener('resize', callbacks);
    const listener = RAFT.getListeners().get('resize');

    expect(listener).to.deep.equal({ callbacks });
  });

  it('adds a single listener when multiple callbacks are provided', () => {
    const callbacks = [() => {}, () => {}];

    RAFT.addListener('scroll', ...callbacks);

    const listeners = RAFT.getListeners();
    expect(listeners.size).to.equal(1);
  });

  it('merges callbacks for pre-existing listeners', () => {
    const fn1 = () => {};
    const fn2 = () => {};
    const fn3 = () => {};

    RAFT.addListener('scroll', fn1, fn2);
    RAFT.addListener('scroll', fn3);

    const listener = RAFT.getListeners().get('scroll');

    expect(listener.callbacks).to.deep.equal([fn1, fn2, fn3]);
  });

  it('is chainable, to add multiple listeners', () => {
    RAFT
      .addListener('scroll', () => {})
      .addListener('resize', () => {});

    const listeners = RAFT.getListeners();

    expect(listeners.size).to.equal(2);
  });

  it('starts the loop', () => {
    expect(RAFT.isRunning()).to.equal(false);

    RAFT.addListener('mousemove', () => {});

    expect(RAFT.isRunning()).to.equal(true);
  });
});
