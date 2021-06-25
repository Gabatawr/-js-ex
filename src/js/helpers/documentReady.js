export default (f, ...args) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => f(...args));
  } else {
    f(...args);
  }
};
