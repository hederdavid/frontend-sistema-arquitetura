<template>
  <div class="flex h-screen font-sans bg-gray-100">
    <div
      :class="[
        isSidebarOpen ? 'w-60' : 'w-0',
        'bg-primary text-white flex-shrink-0 transition-all duration-300 overflow-hidden',
      ]"
    >
      <Sidebar />
    </div>

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="shadow-md bg-white z-10 flex items-center">
        <button
          @click="toggleSidebar"
          class="p-2 text-primary focus:outline-none hover:bg-gray-200 rounded-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
        <Header />
      </div>

      <router-view class="flex-1 overflow-y-auto px-10 pt-8 w-full" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Sidebar from "@/components/admin/Sidebar.vue";
import Header from "@/components/admin/Header.vue";

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>
