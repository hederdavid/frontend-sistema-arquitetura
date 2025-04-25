<script setup>
import GoogleCalendar from "../GoogleCalendar.vue";
import CardProjetos from "./CardProjetos.vue";
</script>
<template>
  <div class="grid grid-cols-[1fr_450px] gap-4">
    <!-- Coluna da esquerda: Projetos -->
    <main>
      <h1 class="text-primary text-3xl mb-5 font-bold">
        Olá, <span class="text-secondary">Anne Beatriz</span> ✌
        <br />
        <span class="font-normal text-lg">Seja bem-vindo(a) ao sistema.</span>
      </h1>

      <div class="flex flex-col">
        <h2 class="text-secondary text-2xl pb-4">Meus Projetos</h2>
        <div class="flex flex-wrap gap-4">
          <CardProjetos v-for="n in 8" :key="n" :index="n" />
        </div>
      </div>
    </main>

    <!-- Coluna da direita: Calendário -->
    <aside class="w-full bg-white rounded-xl shadow-md p-4">
      <h2 class="text-secondary text-2xl pb-4">Calendário</h2>
      <GoogleCalendar />
    </aside>
  </div>
</template>



<style></style>
