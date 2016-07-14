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

// TODO: Unregister listener, and unbind to window if no listeners remain.

// TODO: Consider rewriting with rxjs / rxjs DOM?

// TODO: Perf tests

const compose = (a, b) => x => a(b(x));
const map = fn => arr => arr.map(fn);
const flatten = arr => arr.reduce((memo, i) => (
  Array.isArray(i) ? memo.concat(i) : [...memo, i]
), []);
const flatMap = compose(flatten, map);
const filter = fn => arr => arr.filter(fn);
const keys = arr => Object.keys(arr);
const prop = prop => obj => obj[prop];
const pluck = compose(map, prop);
const filterByProp = compose(filter, prop);
const invokeAll = map(cb => cb());


const RaftFactory = () => {
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

    registeredListeners.forEach(listener => {
      if (!listener.triggeredThisFrame) { return; }

      listener.callbacks.forEach(cb => cb());

      listener.triggeredThisFrame = false;
    });
  };

  return {
    getListeners() {
      // This is exposed primarily for testing purposes.
      // We should not be exposing it in production.
      // Solutions: Deep clone before exporting so it can't be modified,
      // only exposing it when NODE_ENV === test...
      return registeredListeners;
    },

    addListener(eventType, ...callbacks) {
      // Allow for an array of callbacks to be passed in
      if (Array.isArray(callbacks[0])) {
        callbacks = callbacks[0];
      }

      // Because we store registeredListeners as an array, we need to first
      // check if we already have a listener for this eventType.
      const listener = registeredListeners.get(eventType);

      // If we already have the listener, simply merge the callbacks in.
      if (listener) {
        listener.callbacks = [...listener.callbacks, callbacks];
      }
      // Otherwise, create a new listener and push it to registeredListeners
      else {
        registeredListeners.set([eventType, {
          callbacks,
          triggeredThisFrame: false
        }]);
      }

      if (!running) {
        running = true;
        tick();
      }
    },

    removeListener(eventType) {
      registeredListeners.filter(listener => listener.eventType !== eventType);

      if (registeredListeners.length === 0) {
        running = false;
      }
    }
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

// Export a singleton. We only ever want 1 instance of RAFT to exist.
const RAFT = RaftFactory();

export default RAFT;
