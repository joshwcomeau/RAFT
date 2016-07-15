import { expect } from 'chai';
import sinon from 'sinon';

import RAFT from 'src/index';


function createEvent(type, data) {
  let ev;

  try {
    ev = new MouseEvent(type, {
      clientX: data.x,
      clientY: data.y,
    });
  } catch (err) {
    ev = document.createEvent('MouseEvent');
    ev.initMouseEvent(
      type,
      true, // canBubble
      true, // cancelable
      window, // view
      0, // detail
      data.x,
      data.y,
      data.x,
      data.y
    );

  }

  return ev;
}

describe.only('Core functionality', () => {
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
        expect(callback.callCount).to.equal(1);
        const cbEvent = callback.args[0][0];

        expect(cbEvent.x).to.equal(x);
        expect(cbEvent.y).to.equal(y);

        done();
      }, 100);
    });
  });
});
