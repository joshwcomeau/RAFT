import { expect } from 'chai';
import sinon from 'sinon';

import RAFT from 'src/index';
import createEvent from 'test/utils/create-event';


describe('Core functionality', () => {
  describe('mousemove', () => {
    it('calls the listener with the event data', done => {
      const callback = sinon.spy();

      RAFT.addListener('mousemove', callback);

      expect(RAFT.isRunning()).to.equal(true);

      // Random co-ordinates, to trigger the mousemove.
      const [x, y] = [50, 75];

      const ev = createEvent('mousemove', { x, y });
      window.dispatchEvent(ev);

      window.setTimeout(() => {
        // While the event loop will have run many times in the 100ms delay,
        // the callback should only have been invoked once, because there was
        // only a single mousemove event.
        expect(callback.callCount).to.equal(1);

        const cbEvent = callback.args[0][0];
        expect(cbEvent.x).to.equal(x);
        expect(cbEvent.y).to.equal(y);

        done();
      }, 100);
    });
  });
});
