<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @mouseup.self="close"
    >
      <div
        :class="[
          'bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl',
          maxWidthClass,
          'max-h-[80vh] overflow-y-auto',
        ]"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-primary">{{ title }}</h2>
          <button @click="close" class="text-gray-600 hover:text-red-500">
            &times;
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-4">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="showFooter" class="mt-6 flex justify-end">
          <slot name="footer">
            <button
              @click="confirm"
              class="bg-amber-700 hover:bg-amber-800 text-white font-medium px-6 py-2 rounded"
            >
              {{ confirmText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const emit = defineEmits(["close", "confirm"]);

const props = defineProps({
  visible: Boolean,
  title: {
    type: String,
    default: "Modal Title",
  },
  confirmText: {
    type: String,
    default: "Confirmar",
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  maxWidth: {
    type: String,
    default: "xl",
  },
});

const close = () => emit("close");
const confirm = () => emit("confirm");

const maxWidthClass = `max-w-${props.maxWidth}`;
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
