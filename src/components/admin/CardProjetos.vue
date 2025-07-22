<script setup>
import { computed } from "vue";

const props = defineProps({
  projeto: {
    type: Object,
    required: true,
  },
});

const calcularProgresso = computed(() => {
  let totalTarefas = 0;
  let tarefasConcluidas = 0;

  if (props.projeto.subprojetos) {
    props.projeto.subprojetos.forEach((subprojeto) => {
      if (subprojeto.tarefas) {
        totalTarefas += subprojeto.tarefas.length;
        tarefasConcluidas += subprojeto.tarefas.filter(
          (tarefa) => tarefa.status === "CONCLUIDA"
        ).length;
      }
    });
  }

  return totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0;
});

const totalTarefas = computed(() => {
  let total = 0;
  if (props.projeto.subprojetos) {
    props.projeto.subprojetos.forEach((subprojeto) => {
      total += subprojeto.tarefas?.length || 0;
    });
  }
  return total;
});

const tarefasConcluidas = computed(() => {
  let concluidas = 0;
  if (props.projeto.subprojetos) {
    props.projeto.subprojetos.forEach((subprojeto) => {
      if (subprojeto.tarefas) {
        concluidas += subprojeto.tarefas.filter(
          (tarefa) => tarefa.status === "CONCLUIDA"
        ).length;
      }
    });
  }
  return concluidas;
});

const nomeCliente = computed(() => {
  return props.projeto.clienteId?.nome_completo || "Cliente não informado";
});
</script>

<template>
  <div
    class="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:border-secondary hover:border-opacity-50 transform transition-all duration-300 ease-in-out hover:scale-[1.02] cursor-pointer"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="w-10 h-10 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
        <span class="text-secondary text-lg">🏗️</span>
      </div>
      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
        {{ Math.round(calcularProgresso) }}%
      </span>
    </div>

    <h3 class="text-base font-semibold text-gray-800 mb-2 line-clamp-2" :title="projeto.nome">
      {{ projeto.nome }}
    </h3>

    <div class="mb-3">
      <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>Progresso</span>
        <span>{{ tarefasConcluidas }}/{{ totalTarefas }} tarefas</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-gradient-to-r from-secondary to-secondary-dark h-2 rounded-full transition-all duration-500"
          :style="{ width: `${calcularProgresso}%` }"
        ></div>
      </div>
    </div>

    <div class="space-y-2 text-xs">
      <div class="flex items-center gap-2 text-gray-600">
        <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
        <span class="font-medium">Cliente:</span>
        <span class="truncate text-gray-800">{{ nomeCliente }}</span>
      </div>
      <div class="flex items-center gap-2 text-gray-600">
        <span class="w-2 h-2 bg-green-400 rounded-full"></span>
        <span class="font-medium">Responsável:</span>
        <span class="text-gray-800">Anne Beatriz</span>
      </div>
    </div>
  </div>
</template>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
