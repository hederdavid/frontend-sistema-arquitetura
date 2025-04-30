<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const props = defineProps({
  title: {
    type: String,
    default: "Dashboard",
  },
});

</script>

<template>
  <header class="flex justify-between items-center bg-white p-[23px] shadow-md">
    <h2 class="text-xl text-primary font-semibold text-azul-eclipse ml-2">{{ route.meta.title || route.name || 'Dashboard' }}</h2>
  </header>
</template>


