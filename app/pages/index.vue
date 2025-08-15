<template>
  <div>
    <section class="hero min-h-screen bg-base-200 relative overflow-hidden">
      <div class="absolute inset-0 z-0 animated-background"></div>
      <div class="hero-content text-center relative z-10">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold">
            Hi, I'm <span class="text-primary">Rob</span>!
          </h1>
          <p class="py-6 text-2xl">I'm <span id="typed-text" /></p>
          <a href="#projects"
            ><button class="btn btn-primary">View My Work</button></a
          >
        </div>
      </div>
    </section>

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
                <NuxtImg src="/headshot.png" alt="Rob" />
              </div>
            </div>
          </div>
          <div class="md:w-2/3">
            <p class="text-lg mb-4">
              Hi! I'm a passionate and creative web developer with a knack for
              building beautiful and functional websites. I love learning new
              technologies and I'm always looking for exciting projects to work
              on.
            </p>
            <h3 class="text-2xl font-bold mb-4">My Skills</h3>
            <div class="flex flex-wrap gap-4">
              <div class="badge badge-primary badge-lg">HTML5</div>
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
    <section id="projects" class="py-20 bg-base-200">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-12">Works in Progress</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProjectCard
            title="PKMNTradeClub"
            description="A project started to learn and practice Django while facilitating trading between players of Pokémon TCG Pocket, which frustratingly lacks trade matching features."
            source-code-link="https://git.badblocks.dev/badbl0cks/pkmntrade.club"
          />
          <ProjectCard
            title="This Portfolio Site!"
            description="A portfolio site built to explore and learn Nuxt.js while showcasing my projects and skills."
            source-code-link="https://git.badblocks.dev/badbl0cks/portfolio"
          />
          <ProjectCard
            title="Home Lab & Self-Hosted Solutions"
            description="A collection of hardware, software projects, and experiments to learn and explore new technologies and concepts, as well as augment and enhance my personal tech space."
          />
        </div>
      </div>
    </section>
    <section id="projects" class="py-20 bg-base-200">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-12">
          Neat Things I've Done
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProjectCard
            title="PokeEmerald Mods"
            description="Various mods for one of my favorite games, Pokémon Emerald, to streamline my replays with custom QoL features."
            source-code-link="https://git.badblocks.dev/badbl0cks/pokeemerald"
          />
          <ProjectCard
            title="BOTW Completer"
            description="A Nintendo Switch application that helps users find missing items and locations in Breath of the Wild by modifying the save file to add stamps to the in-game map."
            source-code-link="https://git.badblocks.dev/badbl0cks/botw-completer"
          />
          <ProjectCard
            title="EditMii"
            description="An app that allows users to view their WiiU Mii character's data and optionally change the Mii's name. Created in order to easily set flashy, custom names for online play."
          />
        </div>
      </div>
    </section>

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
      "a self-taught Web Developer with experience.",
      "a Bachelor's degree holder in Software Engineering.",
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
.min-h-screen {
  min-height: 100vh;
}

.hero .hero-content {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.animated-background {
  background-image: url("/NZclouds.webp"), url("/NZclouds-static.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
