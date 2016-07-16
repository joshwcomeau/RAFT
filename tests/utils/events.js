import compose from '../../src/utils/compose';

export function createEvent(type, { x, y } = {}) {
  let ev;

  try {
    // The fancy new non-deprecated way!
    // Sadly, PhantomJS supports the old shitty way, so this code throws.
    // Hopefully someday this version will be usable!
    ev = new MouseEvent(type, {
      clientX: x,
      clientY: y,
    });
  } catch (err) {
    ev = document.createEvent('MouseEvent');
    ev.initMouseEvent(
      type,
      true,     // canBubble
      true,     // cancelable
      window,   // view
      0,        // detail
      x,        // screenX
      y,        // screenY
      x,        // clientX
      y         // clientY
    );
  }

  return ev;
}

export const createAndDispatchEvent = compose(window.dispatchEvent, createEvent);
