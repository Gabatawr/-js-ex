import 'focus-visible';
import documentReady from './helpers/documentReady';

// #region linkActive
documentReady(() => {
  document
    .querySelector('.menu__list')
    .querySelectorAll('.menu__link')
    .forEach((link) => {
      if (window.location.href === link.href) {
        link.parentNode.classList.add('menu__item--active');
      }
    });
});
// #endregion linkActive
