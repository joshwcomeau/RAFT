import { expect } from 'chai';

import RAFT from 'src/index';

describe('RAFT singleton', () => {
  it('exports the singleton object, not the constructor', () => {
    expect(typeof RAFT).to.equal('object');
  });

  it('exposes only the designated public methods', () => {
    const publicMethods = [
      'addListener',
      'removeListener',
      'reset',
      'getListeners',
      'isRunning',
    ];
    expect(Object.keys(RAFT)).to.deep.equal(publicMethods);
  });
});
