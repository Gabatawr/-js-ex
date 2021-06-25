import documentReady from './helpers/documentReady';

// #region linkActive
documentReady(() => {
  document
    .querySelector('.menu__list')
    .querySelectorAll('.menu__link')
    .forEach((link) => {
      if (window.location.href === link.href) {
        link.classList.add('menu__link--active');
      }
    });
});
// #endregion linkActive
