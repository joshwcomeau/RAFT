import { expect } from 'chai';
import sinon from 'sinon';

import RAFT from 'src/index';
import { createAndDispatchEvent } from './utils/events';


describe('Core functionality', () => {
  afterEach(() => {
    RAFT.reset();
  });

  it('calls the listener with the event data', done => {
    const callback = sinon.spy();

    RAFT.addListener('mousemove', callback);

    expect(RAFT.isRunning()).to.equal(true);

    // Trigger a mousemove event with random coordinates
    const [x, y] = [50, 75];
    createAndDispatchEvent('mousemove', { x, y });

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

  it('invokes all callbacks registered with the listener', done => {
    const callbacks = [sinon.spy(), sinon.spy()];

    RAFT.addListener('mousemove', callbacks);

    createAndDispatchEvent('mousemove', { x: 150, y: 175 });

    window.setTimeout(() => {
      callbacks.forEach(callback => {
        expect(callback.callCount).to.equal(1);
      });

      done();
    }, 100);
  });

  it('invokes multiple listeners IF an event has been triggered', done => {
    const mousemoveCallback = sinon.spy();
    const clickCallback = sinon.spy();
    const scrollCallback = sinon.spy();

    RAFT
      .addListener('mousemove', mousemoveCallback)
      .addListener('click', clickCallback)
      .addListener('scroll', scrollCallback);

    createAndDispatchEvent('mousemove', { x: 250, y: 275 });
    createAndDispatchEvent('click');

    window.setTimeout(() => {
      expect(mousemoveCallback.callCount).to.equal(1);
      expect(clickCallback.callCount).to.equal(1);
      expect(scrollCallback.callCount).to.equal(0);

      done();
    }, 100);
  });
});
