<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">{{ title }}</h2>
      <p>{{ description }}</p>
      <div class="card-actions justify-end">
        <button
          v-if="liveDemoLink"
          class="btn btn-primary"
          @click="openLink(liveDemoLink)"
        >
          Live Demo
        </button>
        <button
          v-if="sourceCodeLink"
          class="btn btn-secondary"
          @click="openLink(sourceCodeLink)"
        >
          Source Code
        </button>
        <button v-else class="btn btn-secondary btn-disabled">
          Source Code (on the way!)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: "Lorem Ipsum" },
  description: {
    type: String,
    default:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  liveDemoLink: { type: [String, null], default: null },
  sourceCodeLink: { type: [String, null], default: null },
});

function openLink(url) {
  window.open(url, "_blank");
}
</script>
