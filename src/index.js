/*
  RafThrottle is a batched, efficient window event handler.
  It registers a series of callbacks on different window-level events
  (eg. scroll, resize), and fires them all when the event happens. This way,
  we only bind one listener per event.
  Additionally, we use requestAnimationFrame
  (https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
  to ensure that the callbacks are fired ~60fps when possible, with a graceful
  fallback to lodash throttle.
*/


// TODO: Perf tests

const RaftFactory = () => {
  const registeredListeners = new Map();
  let running = false;
  /*
    {
      mousemove: {
        event: <native JS event>,
        callbacks: [fn1, fn2, ...]
      }
    }
  */

  const tick = () => {
    if (!running) { return; }

    // Oh, how I wish I could do this with immutability and map.
    // Sadly, though, this function needs to be performant, and forEach is quick.
    registeredListeners.forEach(listener => {
      if (!listener.event) { return; }

      listener.callbacks.forEach(cb => {
        cb(listener.event);
      });

      // eslint-disable-next-line no-param-reassign
      delete listener.event;
    });

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(tick);
    } else {
      window.setTimeout(tick, 17)
    }

  };

  return {
    addListener(eventType, ...callbacks) {
      // We need to supply a string for eventType
      if (typeof eventType !== 'string') {
        throw new TypeError(`
          Please supply a string to 'addListener' for the 'eventType' argument.
          You supplied a ${typeof eventType}.
        `, 'RAFT');
      }

      // We need at least 1 callback!
      if (callbacks.length === 0) {
        throw new Error(`
          Please supply at least 1 callback when adding a listener.
        `, 'RAFT');
      }

      // Allow for an array of callbacks to be passed in
      if (Array.isArray(callbacks[0])) {
        // eslint-disable-next-line no-param-reassign
        callbacks = callbacks[0];
      }

      // Because we store registeredListeners as an array, we need to first
      // check if we already have a listener for this eventType.
      const listener = registeredListeners.get(eventType);

      if (listener) {
        // If we already have the listener, simply merge the callbacks in.
        listener.callbacks = [...listener.callbacks, ...callbacks];
      } else {
        // Otherwise, create a new listener and push it to registeredListeners
        const newListener = { callbacks };
        registeredListeners.set(eventType, newListener);

        window.addEventListener(eventType, e => {
          newListener.event = e;
        });
      }

      if (!running) {
        running = true;
        tick();
      }

      return this;
    },

    removeListener(eventType) {
      if (typeof eventType === 'undefined') {
        throw new TypeError('Please specify an event type to remove a listener', 'RAFT');
      }

      if (registeredListeners.get(eventType) === undefined) {
        // eslint-disable-next-line no-console
        return console.warn(`
          Warning: Listener not found.
          You tried to remove the event listener ${eventType},
          but no such listener is registered.
        `);
      }

      registeredListeners.delete(eventType);

      if (registeredListeners.size === 0) {
        running = false;
      }

      return this;
    },

    reset() {
      registeredListeners.clear();
      running = false;

      return this;
    },

    getListeners() {
      // This is exposed primarily for testing purposes.
      // We should not be exposing it in production.
      // Solutions: Deep clone before exporting so it can't be modified,
      // only exposing it when NODE_ENV === test...
      return registeredListeners;
    },

    isRunning() {
      return !!running;
    },
  };
};

// Our default export is a singleton.
// We only ever want 1 instance of RAFT to exist.
const RAFT = RaftFactory();

export default RAFT;
