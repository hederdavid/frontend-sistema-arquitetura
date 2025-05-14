<template>
  <transition name="fade">
    <div
      v-if="visible"
      :class="[
        'fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg text-white',
        typeClass,
      ]"
      role="alert"
    >
      <p>{{ message }}</p>
      <button
        @click="close"
        class="absolute top-1 right-1 text-white hover:text-gray-300"
      >
        &times;
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { defineProps, defineEmits } from "vue";

const emit = defineEmits(["close"]);

const props = defineProps({
  type: {
    type: String,
    default: "success",
  },
  message: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    required: true,
  },
  duration: {
    type: Number,
    default: 3000,
  },
});

const typeClass = computed(() =>
  props.type === "success" ? "bg-green-500" : "bg-red-500"
);

const close = () => {
  emit("close");
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
