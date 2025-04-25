<template>
  <div class="flex h-screen font-sans bg-gray-100">
    <div class="w-60 bg-primary text-white flex-shrink-0">
      <Sidebar />
    </div>

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="shadow-md bg-white z-10">
        <Header />
      </div>

      <TelaInicial class="flex-1 overflow-y-auto px-10 pt-8" />
      
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/components/admin/Sidebar.vue";
import Header from "@/components/admin/Header.vue";
import TelaInicial from "@/components/admin/TelaInicial.vue";
</script>
