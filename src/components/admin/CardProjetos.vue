<script setup>
const progress = 40; // substitua por uma variável reativa conforme o progresso
</script>

<template>
  <div
    class="bg-white w-56 p-3 flex flex-col gap-3 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg"
  >
    <img
      class="w-12"
      src="../icons/casa-projeto.svg"
      alt="Ícone casa projeto"
    />
    <h3 class="text-lg text-secondary">Projeto Casa Popular</h3>

    <div class="flex items-center gap-2">
      <!-- Barra de progresso -->
      <div class="w-full bg-neutral-200 rounded-full h-1 overflow-hidden">
        <div
          class="bg-secondary h-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <!-- Texto com a % -->
      <span class="text-xs font-medium text-neutral-700 w-9 text-right">
        {{ Math.round(progress) }}%
      </span>
    </div>

    <p class="text-sm">3/12 tarefas concluídas</p>

    <div class="flex flex-col gap-1.5 border-b-2 pb-2">
      <h4 class="text-secondary opacity-70 text-sm">Responsável</h4>
      <p class="text-primary flex gap-1 items-center text-sm">
        <img src="../icons/usuario.svg" alt="Ícone do usuário" />
        <span class="pt-0.5">Anne Beatriz</span>
      </p>
    </div>

    <div class="flex flex-col gap-1.5 pb-2">
      <h4 class="text-secondary opacity-70 text-sm">Cliente</h4>
      <p class="text-primary flex gap-1 items-center text-sm">
        <img src="../icons/usuario.svg" alt="Ícone do usuário" />
        <span class="pt-0.5">João da Silva</span>
      </p>
    </div>
  </div>
</template>

<style></style>
