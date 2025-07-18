<template>
  <div>
    <!-- Hero Section -->
    <section class="hero min-h-screen bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">
            Hi, I'm <span class="text-primary">Rob</span>!
          </h1>
          <p class="py-6 text-2xl">I'm <span id="typed-text"></span></p>
          <button class="btn btn-primary">View My Work</button>
        </div>
      </div>
    </section>

    <!-- About Me Section -->
    <section id="about" class="py-20 bg-base-100">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-12">About Me</h2>
        <div
          class="flex flex-col md:flex-row items-center justify-center gap-10"
        >
          <div class="md:w-1/3 text-center">
            <div class="avatar">
              <div
                class="w-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
              >
                <img src="/headshot_pp.png" alt="Rob" />
              </div>
            </div>
          </div>
          <div class="md:w-2/3">
            <p class="text-lg mb-4">
              Hello! I'm a passionate and creative junior web developer with a
              knack for building beautiful and functional websites. I love
              learning new technologies and I'm always looking for exciting
              projects to work on.
            </p>
            <h3 class="text-2xl font-bold mb-4">My Skills</h3>
            <div class="flex flex-wrap gap-4">
              <div class="badge badge-primary badge-lg">HTML</div>
              <div class="badge badge-primary badge-lg">CSS</div>
              <div class="badge badge-primary badge-lg">JavaScript</div>
              <div class="badge badge-primary badge-lg">Git</div>
              <div class="badge badge-primary badge-lg">Nuxt.js</div>
              <div class="badge badge-primary badge-lg">Tailwind CSS</div>
              <div class="badge badge-primary badge-lg">Docker</div>
              <div class="badge badge-primary badge-lg">Node/Bun</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="py-20 bg-base-200">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-12">My Projects</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Project Card 1 -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Project One</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">Live Demo</button>
                <button class="btn btn-secondary">Source Code</button>
              </div>
            </div>
          </div>
          <!-- Project Card 2 -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Project Two</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">Live Demo</button>
                <button class="btn btn-secondary">Source Code</button>
              </div>
            </div>
          </div>
          <!-- Project Card 3 -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Project Three</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">Live Demo</button>
                <button class="btn btn-secondary">Source Code</button>
              </div>
            </div>
          </div>
          <!-- Project Card 4 -->
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Project Four</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <div class="card-actions justify-end">
                <button class="btn btn-primary">Live Demo</button>
                <button class="btn btn-secondary">Source Code</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-20 bg-base-100">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-12">Get In Touch</h2>
        <ContactForm />
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import Typed from "typed.js";

onMounted(() => {
  const { $sr } = useNuxtApp();
  const typedOptions = {
    strings: [
      "an aspiring Software Engineer.",
      "a self-taught Web Developer with experience.",
      "a Full-Stack Magician.",
      "a UI/UX Problem Solver.",
      "a Web Accessibility Advocate.",
      "an Open Source Contributor.",
      "a Collaborative Team Player.",
    ],
    typeSpeed: 60,
    backSpeed: 40,
    loop: true,
    cursorChar: "|",
  };

  new Typed("#typed-text", typedOptions);

  $sr.reveal(".hero h1", { delay: 200 });
  $sr.reveal(".hero p", { delay: 400 });
  $sr.reveal(".hero .btn", { delay: 600 });

  $sr.reveal("#about h2, #projects h2, #contact h2", { delay: 200 });

  $sr.reveal("#about .avatar", { origin: "left", delay: 300 });
  $sr.reveal("#about .md\\:w-2\\/3", { origin: "right", delay: 400 });

  $sr.reveal("#projects .card", { interval: 100 });

  $sr.reveal("#contact .max-w-xl", { delay: 300 });
});
</script>

<style>
/* Ensuring the hero section takes the full viewport height */
.min-h-screen {
  min-height: 100vh;
}
</style>
