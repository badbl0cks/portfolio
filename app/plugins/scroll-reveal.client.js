import ScrollReveal from "scrollreveal";

export default defineNuxtPlugin((nuxtApp) => {
  const defaultOptions = {
    origin: "bottom",
    distance: "80px",
    duration: 1000,
    delay: 200,
    easing: "cubic-bezier(0.5, 0, 0, 1)",
    reset: true,
  };

  const sr = ScrollReveal(defaultOptions);

  nuxtApp.provide("sr", sr);
});
