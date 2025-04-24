<template>
  <div class="flex h-screen font-sans bg-gray-100">
    <div class="w-64 bg-primary text-white">
      <Sidebar />
    </div>

    <div class="flex-1 flex flex-col overflow-hidden">

      <div class="shadow-md bg-white z-10">
        <Header />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/components/admin/Sidebar.vue";
import Header from "@/components/admin/Header.vue";
</script>
