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

  it('invokes only the listeners that have been triggered', done => {
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

  it('invokes at most every ~16ms', done => {
    let t1 = performance.now();
    let t2;
    let durations = [];

    // Set up a listener to log the time since the previous cb application.
    RAFT.addListener('mousemove', () => {
      t2 = performance.now();
      durations.push(t2 - t1);
      t1 = t2;
    });

    // Set up a loop to trigger mousemoves every 5ms.
    // The idea here is that the event will be triggered multiple times per
    // animationFrame, and we're hoping that the listener is only Invoked
    // every ~16.6ms.
    const totalIterations = 50;
    let currentIteration = 0;
    const mousemoveLoop = window.setInterval(() => {
      createAndDispatchEvent('mousemove', {
        x: Math.round(Math.random() * 100),
        y: Math.round(Math.random() * 100),
      });

      currentIteration++;
      if (currentIteration >= totalIterations) {
        window.clearInterval(mousemoveLoop);
        // Exclude the very first duration captured.
        // This is because the first animationFrame might happen right away,
        // since there was no reason to wait beforehand.
        durations = durations.slice(1);

        const durationSum = durations.reduce((total, num) => total + num);
        const durationAverage = durationSum / durations.length;

        expect(durationAverage).to.be.within(15.5, 17.5);

        done();
      }
    }, 5);
  });
});
