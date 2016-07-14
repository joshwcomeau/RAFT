import { expect } from 'chai';

import RAFT from 'src/index';

describe('RAFT', () => {
  it('exposes only the designated public methods', () => {
    const publicMethods = ['getListeners', 'addListener', 'removeListener'];
    console.log(Object.keys(RAFT));
    console.log(publicMethods);
    expect(Object.keys(RAFT)).to.deep.equal(publicMethods);
  });
});
