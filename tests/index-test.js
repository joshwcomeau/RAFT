import { expect } from 'chai';

import RAFT from 'src/index';

describe('RAFT singleton', () => {
  it('exports the singleton object, not the constructor', () => {
    expect(typeof RAFT).to.equal('object');
  });

  it('exposes only the designated public methods', () => {
    const publicMethods = ['getListeners', 'addListener', 'removeListener', 'reset'];
    expect(Object.keys(RAFT)).to.deep.equal(publicMethods);
  });
});

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

    const listeners = RAFT.getListeners();
    const mousemoveListener = listeners.get('mousemove');

    expect(listeners.size).to.equal(1);
    expect(mousemoveListener).to.deep.equal({
      triggeredThisFrame: false,
      callbacks: [fn],
    });
  });
});
