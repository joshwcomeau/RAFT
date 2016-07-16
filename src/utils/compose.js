const compose = (a, b) => (...args) => a(b(...args));

export default compose;
