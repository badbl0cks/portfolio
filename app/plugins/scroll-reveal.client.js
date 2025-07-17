import ScrollReveal from 'scrollreveal';

export default defineNuxtPlugin((nuxtApp) => {
  const defaultOptions = {
    origin: 'bottom',
    distance: '80px',
    duration: 1000,
    delay: 200,
    easing: 'cubic-bezier(0.5, 0, 0, 1)',
    reset: true,
  };

  const sr = ScrollReveal(defaultOptions);

  // You can make it available to the rest of your Nuxt application
  // by returning it in the `provide` object.
  // This makes it accessible as `$sr` in your components.
  nuxtApp.provide('sr', sr);
});
