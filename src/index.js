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

// NOTE: We are exporting the factory _only for test purposes_.
// The default export, defined at the bottom of this file, is a singleton.
export const RaftFactory = () => {
  let registeredListeners = new Map();
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

    registeredListeners.forEach((listener, eventName) => {
      if (!listener.triggeredThisFrame) { return; }

      listener.callbacks.forEach(cb => cb());

      listener.triggeredThisFrame = false;
    });
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
        listener.callbacks = [...listener.callbacks, callbacks];
      } else {
        // Otherwise, create a new listener and push it to registeredListeners
        registeredListeners.set(eventType, {
          callbacks,
          triggeredThisFrame: false,
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

  // // How it works:
  // // Every tick, our main `run` function invokes. It finds all updated
  //
  // const triggeredListeners = registeredListeners.filter(listener => (
  //   listener.triggeredThisFrame
  // ));
  //
  // triggeredListeners
  //
  // const filterTriggered = filterByProp('triggeredThisFrame');
  // const triggeredListeners = filterTriggered(registeredListeners);
  //
  // pluck('callbacks')(filterByProp('triggeredThisFrame')(registeredListeners))
  // invokeAll(callbacks);
  //
  //
  // const invokeTriggered = map(filterTriggered(data)
  //
  // registeredCallbacks
  //   .filter(listener => listener.triggeredThisFrame)
  //   .map(listener => listener.callbacks.forEach(cb => cb()));
}





//
// const RAFT = () => {
//   // This initialization runs the first time RAFT is imported.
//   // It's a singleton, and methods are added to it via the exposed methods,
//   // NOT through constructor-style params.
//
//   // Callbacks are held in an object keyed by the event type.
//   // eg. { mousemove: [fn1, fn2], scroll: [fn1, fn3] }
//   // This is built below, in `bindToWindow`
//   let callbacks;
//
//   // Store the actual event-listeners in an object, so they can be removed.
//   const eventListeners = {};
//
//   let wasAlreadyTriggeredThisFrame = false;
//
//
//   /**
//    * bindToWindow
//    * Invoked to register a
//    * Responsible for kicking off the RAF loop that runs our callbacks
//    */
//   const bindEventToWindow = eventName => {
//     const listenerAlreadyRegistered = typeof eventListeners[eventName] !== 'undefined';
//     // If there's already a registered listener for this event, do nothing.
//     if (eventListeners[eventName]) { return; }
//
//     // If running in a headless/server environment, do nothing
//     if (!window || !window.addEventListener) { return; }
//
//     callbacks = {
//       ...callbacks,
//       ...callbacksToRegister,
//     };
//
//     eventNames.forEach(eventName => {
//       window.addEventListener(eventName, ev => rafThrottle(ev, eventName));
//     });
//
//     isBoundToWindow = true;
//   }
// }
//
//
//
// const invokeAllCallbacksForEvent = (ev, eventName) => {
//   callbacks[eventName].forEach(cb => cb(ev));
//   wasAlreadyTriggeredThisFrame = false;
// };
//
// // Invoke all callbacks, with the event object, for the corresponding
// // event type. For example, whenever the mouse moves, this callback
// // fires with the mousemove data, and the `mousemove` event name.
// // We'll iterate through and fire all mousemove callbacks with the event.
// const rafThrottle = (...args) => {
//   if (!wasAlreadyTriggeredThisFrame) {
//     wasAlreadyTriggeredThisFrame = true;
//
//     if (window.requestAnimationFrame) {
//       window.requestAnimationFrame(() => {
//         invokeAllCallbacksForEvent(...args);
//       });
//     } else {
//       // Fall back to using setTimeout.
//       // Invoke after a suitable delay.
//       window.setTimeout(() => {
//         invokeAllCallbacksForEvent(...args);
//         wasAlreadyTriggeredThisFrame = false;
//       }, 20);
//     }
//   }
// };
//
// export const registerListener = (fn, event) => {
//   // If RAFT isn't already running, bind it to window.
//   if (!isBoundToWindow) {
//     bindToWindow();
//   }
//
//   callbacks[event].push(fn);
// };
//
// export const bindToWindow = ({
//   initialCallbacks = {},
//   eventNames = defaultEventNames,
// } = {}) => {
//   // Don't allow multiple bindings.
//   if (isBoundToWindow) { return; }
//
//   // If running in a headless/server environment, don't attempt to actually
//   // bind anything.
//   if (!window || !window.addEventListener) {
//     isBoundToWindow = true;
//     return;
//   }
//
//   // Build our callbacks object, using any supplied initial callbacks.
//   callbacks = eventNames.reduce((acc, name) => (
//     {
//       ...acc,
//       [name]: initialCallbacks[name] || [],
//     }
//   ), {});
//
//   eventNames.forEach(eventName => {
//     window.addEventListener(eventName, ev => rafThrottle(ev, eventName));
//   });
//
//   isBoundToWindow = true;
// };

// Our default export is a singleton.
// We only ever want 1 instance of RAFT to exist.
const RAFT = RaftFactory();

export default RAFT;
