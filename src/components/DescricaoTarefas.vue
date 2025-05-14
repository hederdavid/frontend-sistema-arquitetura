<template>
    <div>
      <div class="flex gap-2 items-center mb-4">
        <h3 class="text-black opacity-50 shrink-0">{{ status }}</h3>
        <hr class="inline-block w-full border-t-2 border-secondary opacity-50" />
      </div>
  
      <div class="flex flex-col gap-4">
        <div
          v-for="(tarefa, index) in tarefas"
          :key="index"
          class="flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2 overflow-hidden">
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="tarefa.concluida"
                class="hidden"
              />
              <div
                class="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center"
              >
                <div
                  v-if="tarefa.concluida"
                  class="w-3 h-3 bg-black rounded-full"
                ></div>
              </div>
            </label>
  
            <p
              class="text-black truncate max-w-[120px]"
              :class="{ 'line-through opacity-50': tarefa.concluida }"
            >
              {{ tarefa.nome }}
            </p>
  
            <div class="flex items-center gap-1">
              <span class="text-2xl">🏠</span>
              <p
                class="text-black truncate max-w-[100px]"
                :class="{ 'line-through opacity-50': tarefa.concluida }"
              >
                {{ tarefa.projeto }}
              </p>
            </div>
          </div>
  
          <button class="border border-orange-500 p-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive } from "vue";
  
  const props = defineProps({
    status: {
      type: String,
      required: true,
    },
    tarefas: {
      type: Array,
      required: true,
    },
  });
  
  const tarefas = reactive(
    props.tarefas.map(tarefa => ({
      ...tarefa,
      concluida: tarefa.status === "CONCLUÍDO"
    }))
  );
  </script>
  
  <style scoped>
  button:focus {
    outline: none;
  }
  </style>
  