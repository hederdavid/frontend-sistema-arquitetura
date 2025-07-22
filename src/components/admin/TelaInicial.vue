<script setup>
import { ref, onMounted, computed } from "vue";
import router from "@/router";
import CardProjetos from "./CardProjetos.vue";
import { API_URL } from "../../utils/apiUrl.js";

const projetos = ref([]);
const tarefasProjetos = ref([]);

const STATUS = {
  NAO_INICIADA: "NAO_INICIADA",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  CONCLUIDA: "CONCLUIDA",
};

const carregarProjetos = async () => {
  try {
    const response = await fetch(`${API_URL}/projetos`);
    if (!response.ok) throw new Error("Erro ao carregar projetos");

    const data = await response.json();
    projetos.value = data;

    // Processar tarefas de todos os projetos
    const todasTarefas = [];
    data.forEach((projeto) => {
      if (projeto.subprojetos && projeto.subprojetos.length > 0) {
        projeto.subprojetos.forEach((subprojeto) => {
          if (subprojeto.tarefas && subprojeto.tarefas.length > 0) {
            subprojeto.tarefas.forEach((tarefa) => {
              const nomeTarefa = tarefa.tarefaId?.nome || "Tarefa sem nome";
              const statusTarefa = tarefa.status || "NAO_INICIADA";

              todasTarefas.push({
                nome: nomeTarefa,
                projeto: projeto.nome,
                status: statusTarefa,
              });
            });
          }
        });
      }
    });

    tarefasProjetos.value = todasTarefas;
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
  }
};

const tarefasNaoIniciadas = computed(() =>
  tarefasProjetos.value.filter(
    (tarefa) => tarefa.status === STATUS.NAO_INICIADA
  )
);

const tarefasEmAndamento = computed(() =>
  tarefasProjetos.value.filter(
    (tarefa) => tarefa.status === STATUS.EM_ANDAMENTO
  )
);

const tarefasConcluidas = computed(() =>
  tarefasProjetos.value.filter((tarefa) => tarefa.status === STATUS.CONCLUIDA)
);

const redirectToProjetos = () => {
  router.push("/projetos");
};

const redirectToTarefas = () => {
  router.push("/tarefas");
};

onMounted(() => {
  carregarProjetos();
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6"
  >
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-primary text-4xl mb-2 font-bold">
        Olá, <span class="text-secondary">Anne Beatriz</span> ✌️
      </h1>
      <p class="text-gray-600 text-lg">
        Bem-vindo de volta! Aqui está um resumo do seu progresso.
      </p>
    </div>

    <!-- Dashboard Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total de Projetos -->
      <div
        class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Total de Projetos</p>
            <p class="text-3xl font-bold text-gray-800">
              {{ projetos.length }}
            </p>
          </div>
          <div class="bg-blue-100 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Tarefas Pendentes -->
      <div
        class="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow duration-300"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Tarefas Pendentes</p>
            <p class="text-3xl font-bold text-gray-800">
              {{ tarefasNaoIniciadas.length }}
            </p>
          </div>
          <div class="bg-yellow-100 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Tarefas em Andamento -->
      <div
        class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Em Andamento</p>
            <p class="text-3xl font-bold text-gray-800">
              {{ tarefasEmAndamento.length }}
            </p>
          </div>
          <div class="bg-blue-100 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Tarefas Concluídas -->
      <div
        class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm font-medium">Concluídas</p>
            <p class="text-3xl font-bold text-gray-800">
              {{ tarefasConcluidas.length }}
            </p>
          </div>
          <div class="bg-green-100 p-3 rounded-full">
            <svg
              class="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Seções Principais -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <!-- Projetos -->
      <div class="xl:col-span-2">
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h2
              class="text-2xl font-bold text-gray-800 flex items-center gap-2"
            >
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
              Meus Projetos
            </h2>
            <button
              @click="redirectToProjetos"
              class="bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-secondary-dark transition-colors duration-300 flex items-center gap-2"
            >
              <span>Ver Todos</span>
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </div>

          <div
            v-if="projetos.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <CardProjetos
              @click="router.push(`/projetos`)"
              v-for="projeto in projetos.slice(0, 6)"
              :key="projeto._id"
              :projeto="projeto"
            />
          </div>

          <div v-else class="text-center py-12">
            <div class="text-gray-400 mb-4 flex justify-center">
              <svg
                class="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                ></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-600 mb-2">
              Nenhum projeto encontrado
            </h3>
            <p class="text-gray-500 mb-4">
              Comece criando seu primeiro projeto arquitetônico
            </p>
            <button
              @click="redirectToProjetos"
              class="bg-secondary text-white font-semibold py-2 px-6 rounded-lg hover:bg-secondary-dark transition-colors duration-300"
            >
              Criar Projeto
            </button>
          </div>
        </div>
      </div>

      <!-- Sidebar com Tarefas Recentes -->
      <div class="space-y-6">
        <!-- Tarefas Recentes -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span class="text-lg">📋</span>
              Tarefas Recentes
            </h3>
            <button
              @click="redirectToTarefas"
              class="text-secondary hover:text-secondary-dark font-medium text-sm flex items-center gap-1"
            >
              <span>Ver todas</span>
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </div>

          <div class="space-y-3">
            <!-- Tarefas Não Iniciadas -->
            <div
              v-for="(tarefa, index) in tarefasNaoIniciadas.slice(0, 3)"
              :key="`nao-${index}`"
            >
              <div
                class="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors duration-200"
              >
                <div
                  class="w-3 h-3 bg-yellow-400 rounded-full flex-shrink-0"
                ></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">
                    {{ tarefa.nome }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    {{ tarefa.projeto }}
                  </p>
                </div>
                <span
                  class="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium"
                  >Pendente</span
                >
              </div>
            </div>

            <!-- Tarefas Em Andamento -->
            <div
              v-for="(tarefa, index) in tarefasEmAndamento.slice(0, 2)"
              :key="`and-${index}`"
            >
              <div
                class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
              >
                <div
                  class="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0 animate-pulse"
                ></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">
                    {{ tarefa.nome }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    {{ tarefa.projeto }}
                  </p>
                </div>
                <span
                  class="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-medium"
                  >Em Curso</span
                >
              </div>
            </div>

            <!-- Estado Vazio -->
            <div v-if="tarefasProjetos.length === 0" class="text-center py-6">
              <div class="text-gray-400 text-4xl mb-2">📋</div>
              <p class="text-sm text-gray-500">Nenhuma tarefa encontrada</p>
              <button
                @click="redirectToTarefas"
                class="mt-2 text-secondary hover:text-secondary-dark font-medium text-sm"
              >
                Criar primeira tarefa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Animação suave para cards */
.group:hover {
  transform: translateY(-1px);
}
</style>
