<script setup>
import { ref, watch } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { API_URL } from "../../utils/apiUrl.js";
import { defineProps, defineEmits } from "vue";
import {
  mostrarAlertaErro,
  mostrarAlertaAtencao,
  mostrarAlertaInfo,
} from "@/utils/utilitarios.js";

import MensagemNotificacao from "@/components/MensagemNotificacao.vue";
const showNotification = ref(false);
const notificationType = ref("success");
const notificationMessage = ref("");

const showSuccess = () => {
  notificationType.value = "success";
  notificationMessage.value = "Projeto atualizado com sucesso!";
  showNotification.value = true;
};

const showError = () => {
  notificationType.value = "error";
  notificationMessage.value = "Erro ao atualizar o projeto!";
  showNotification.value = true;
  isModalOpen.value = false;
};

const props = defineProps({
  projeto: {
    type: Object,
    required: true,
  },
});

const projetoLocal = ref({
  ...props.projeto,
});

const clientes = ref([]);
const subprojetosDisponiveis = ref([]);
const subprojetosSelecionados = ref([]);

watch(
  () => props.projeto,
  (novo) => {
    projetoLocal.value = {
      ...novo,
    };
  },
  { deep: true }
);

const emit = defineEmits(["projetoAtualizado", "projetoExcluido"]);

const isModalOpen = ref(false);

const carregarClientes = async () => {
  try {
    const response = await fetch(`${API_URL}/clientes`);
    if (!response.ok) throw new Error("Erro ao carregar clientes");
    const data = await response.json();
    clientes.value = data;
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
  }
};

const carregarSubprojetos = async () => {
  try {
    const response = await fetch(`${API_URL}/subprojetos`);
    if (!response.ok) throw new Error("Erro ao carregar subprojetos");
    const data = await response.json();
    subprojetosDisponiveis.value = data;
  } catch (error) {
    console.error("Erro ao carregar subprojetos:", error);
  }
};

const carregarTarefasDoSubprojeto = async (subprojetoId, subprojetoIndex) => {
  if (!subprojetoId) {
    subprojetosSelecionados.value[subprojetoIndex].tarefas = [];
    return;
  }

  try {
    const response = await fetch(`${API_URL}/subprojetos/${subprojetoId}`);
    if (!response.ok) throw new Error("Erro ao carregar tarefas do subprojeto");

    const subprojeto = await response.json();

    subprojetosSelecionados.value[subprojetoIndex].tarefas =
      subprojeto.tarefas.map((tarefa) => ({
        tarefaId: typeof tarefa === "object" ? tarefa._id : tarefa,
        tarefaNome: typeof tarefa === "object" ? tarefa.nome : "",
        dataInicio: "",
        dataFimPrevista: "",
        dataFimReal: "",
        status: "NAO_INICIADA",
        observacoes: "",
      }));

    if (
      subprojeto.tarefas.length > 0 &&
      typeof subprojeto.tarefas[0] === "string"
    ) {
      for (
        let i = 0;
        i < subprojetosSelecionados.value[subprojetoIndex].tarefas.length;
        i++
      ) {
        const tarefaId = subprojeto.tarefas[i];
        const tarefaResponse = await fetch(`${API_URL}/tarefas/${tarefaId}`);
        if (tarefaResponse.ok) {
          const tarefaDetalhes = await tarefaResponse.json();
          subprojetosSelecionados.value[subprojetoIndex].tarefas[i].tarefaNome =
            tarefaDetalhes.nome;
        }
      }
    }
  } catch (error) {
    console.error("Erro ao carregar tarefas do subprojeto:", error);
    mostrarAlertaErro(
      "Erro",
      "Não foi possível carregar as tarefas do subprojeto."
    );
  }
};

const adicionarSubprojeto = () => {
  subprojetosSelecionados.value.push({
    subprojetoId: "",
    tarefas: [],
  });
};

const removerSubprojeto = (index) => {
  subprojetosSelecionados.value.splice(index, 1);
};

const openEditarModal = async () => {
  isModalOpen.value = true;
  projetoLocal.value = {
    ...props.projeto,
  };

  subprojetosSelecionados.value = props.projeto.subprojetos
    ? [...props.projeto.subprojetos]
    : [];

  await carregarClientes();
  await carregarSubprojetos();
};

const openDescricaoModal = () => {
  mostrarAlertaInfo(
    "Descrição do Projeto",
    projetoLocal.value.descricao || "Nenhuma descrição fornecida."
  );
};

const atualizarProjeto = async () => {
  const p = {
    ...projetoLocal.value,
    subprojetos: subprojetosSelecionados.value
      .filter((sub) => sub.subprojetoId && sub.tarefas.length > 0)
      .map((sub) => ({
        subprojetoId: sub.subprojetoId,
        tarefas: sub.tarefas.map((tarefa) => ({
          tarefaId: tarefa.tarefaId,
          dataInicio: tarefa.dataInicio,
          dataFimPrevista: tarefa.dataFimPrevista,
          dataFimReal: tarefa.dataFimReal,
          status: tarefa.status,
          observacoes: tarefa.observacoes || "",
        })),
      })),
  };

  if (
    !p.nome ||
    !p.descricao ||
    !p.clienteId ||
    !p.dataInicio ||
    !p.dataFimPrevista
  ) {
    mostrarAlertaErro("Erro", "Preencha todos os campos obrigatórios.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/projetos/${p._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(p),
    });

    if (!response.ok) throw new Error("Erro ao atualizar projeto");

    const data = await response.json();
    emit("projetoAtualizado", p);
    console.log("Projeto atualizado:", data);

    isModalOpen.value = false;
    showSuccess();
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    showError();
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  }
};

const excluirProjeto = async (id) => {
  const resultConfirm = await mostrarAlertaAtencao(
    "Atenção",
    "Você tem certeza que deseja excluir esse projeto?"
  );
  if (!resultConfirm.isConfirmed) return;

  if (!id) {
    mostrarAlertaErro("Erro", "ID do projeto não encontrado.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/projetos/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao excluir projeto");

    console.log("Projeto excluído:", id);
    emit("projetoExcluido", id);
  } catch (error) {
    console.error("Erro ao excluir projeto:", error);
    notificationType.value = "error";
    notificationMessage.value = "Erro ao excluir o projeto!";
    showNotification.value = true;

    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  }
};

// Funções auxiliares para o novo layout
const formatarData = (data) => {
  if (!data) return "Não definida";
  return new Date(data).toLocaleDateString("pt-BR");
};

const calcularDuracao = (dataInicio, dataFim) => {
  if (!dataInicio || !dataFim) return "Não definida";
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffTime = Math.abs(fim - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} dias`;
};

const contarTotalTarefas = () => {
  let total = 0;
  if (props.projeto.subprojetos) {
    props.projeto.subprojetos.forEach(sub => {
      total += sub.tarefas?.length || 0;
    });
  }
  return total;
};

const contarTarefasConcluidas = () => {
  let concluidas = 0;
  if (props.projeto.subprojetos) {
    props.projeto.subprojetos.forEach(sub => {
      if (sub.tarefas) {
        sub.tarefas.forEach(tarefa => {
          if (tarefa.status === "CONCLUIDA") {
            concluidas++;
          }
        });
      }
    });
  }
  return concluidas;
};

const calcularProgressoPercentual = () => {
  const total = contarTotalTarefas();
  const concluidas = contarTarefasConcluidas();
  return total > 0 ? (concluidas / total) * 100 : 0;
};

const obterNomeCliente = (clienteId) => {
  const cliente = clientes.value.find(c => c._id === clienteId);
  return cliente?.nome_completo || "Cliente não encontrado";
};

const obterNomeSubprojeto = (subprojetoId) => {
  const subprojeto = subprojetosDisponiveis.value.find(s => s._id === subprojetoId);
  return subprojeto?.nome || "Subprojeto não encontrado";
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md border border-gray-200 mb-4 p-6 transition-all duration-300 hover:shadow-lg">
    <!-- Header do Projeto -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <h3 class="text-xl font-bold text-primary mb-2">
          {{ props.projeto.nome }}
        </h3>
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <span class="font-medium">Cliente:</span>
            <span>{{ obterNomeCliente(props.projeto.clienteId) }}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="font-medium">Subprojetos:</span>
            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {{ props.projeto.subprojetos?.length || 0 }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col items-end gap-2">
        <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          PROJETO
        </span>
        <div class="text-xs text-gray-500">
          ID: {{ props.projeto._id?.slice(-8) }}
        </div>
      </div>
    </div>

    <!-- Informações do Projeto -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <!-- Datas -->
      <div class="bg-gray-50 rounded-lg p-3">
        <h4 class="font-semibold text-primary text-sm mb-2">📅 Cronograma</h4>
        <div class="space-y-1 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-600">Início:</span>
            <span class="font-medium">{{ formatarData(props.projeto.dataInicio) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Fim Previsto:</span>
            <span class="font-medium">{{ formatarData(props.projeto.dataFimPrevista) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Duração:</span>
            <span class="font-medium">{{ calcularDuracao(props.projeto.dataInicio, props.projeto.dataFimPrevista) }}</span>
          </div>
        </div>
      </div>

      <!-- Status das Tarefas -->
      <div class="bg-gray-50 rounded-lg p-3">
        <h4 class="font-semibold text-primary text-sm mb-2">📊 Progresso</h4>
        <div class="space-y-1 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-600">Total Tarefas:</span>
            <span class="font-medium">{{ contarTotalTarefas() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Concluídas:</span>
            <span class="font-medium text-green-600">{{ contarTarefasConcluidas() }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              class="bg-green-500 h-2 rounded-full transition-all duration-300" 
              :style="{ width: calcularProgressoPercentual() + '%' }"
            ></div>
          </div>
          <div class="text-center text-xs text-gray-600 mt-1">
            {{ calcularProgressoPercentual().toFixed(0) }}% concluído
          </div>
        </div>
      </div>

      <!-- Descrição Preview -->
      <div class="bg-gray-50 rounded-lg p-3">
        <h4 class="font-semibold text-primary text-sm mb-2">📝 Descrição</h4>
        <p class="text-xs text-gray-600 line-clamp-3">
          {{ props.projeto.descricao || 'Nenhuma descrição fornecida.' }}
        </p>
        <button
          @click="openDescricaoModal"
          class="text-blue-600 hover:text-blue-800 text-xs mt-1 underline"
        >
          Ver completa
        </button>
      </div>
    </div>

    <!-- Subprojetos Preview -->
    <div v-if="props.projeto.subprojetos && props.projeto.subprojetos.length > 0" class="mb-4">
      <h4 class="font-semibold text-primary text-sm mb-2">🎯 Subprojetos</h4>
      <div class="flex flex-wrap gap-2">
        <div 
          v-for="(subprojeto, index) in props.projeto.subprojetos.slice(0, 3)"
          :key="index"
          class="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs"
        >
          {{ obterNomeSubprojeto(subprojeto.subprojetoId) }}
          <span class="ml-1 bg-amber-200 px-1 rounded">
            {{ subprojeto.tarefas?.length || 0 }}
          </span>
        </div>
        <div 
          v-if="props.projeto.subprojetos.length > 3"
          class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
        >
          +{{ props.projeto.subprojetos.length - 3 }} mais
        </div>
      </div>
    </div>

    <!-- Ações -->
    <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
      <button
        @click="openDescricaoModal"
        class="text-white bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm"
      >
        📄 Detalhes
      </button>
      <button
        @click="openEditarModal"
        class="text-white bg-orange-600 hover:bg-orange-700 font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm"
      >
        ✏️ Editar
      </button>
      <button
        @click="excluirProjeto(projetoLocal._id)"
        class="text-white bg-red-600 hover:bg-red-700 font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm"
      >
        🗑️ Excluir
      </button>
    </div>
  </div>

  <BaseModal
    :visible="isModalOpen"
    title="Atualizar Projeto"
    confirm-text="Salvar"
    @close="isModalOpen = false"
    @confirm="atualizarProjeto"
  >
    <form class="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
      <!-- Nome e Cliente -->
      <div class="col-span-2 flex w-full gap-4">
        <input
          v-model="projetoLocal.nome"
          type="text"
          class="flex-[1.5] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Nome do projeto *"
          required
        />
        <select
          v-model="projetoLocal.clienteId"
          class="flex-[1] min-w-0 border border-amber-700 rounded px-4 py-2 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          required
        >
          <option value="">Selecione o cliente *</option>
          <option
            v-for="cliente in clientes"
            :key="cliente._id"
            :value="cliente._id"
          >
            {{ cliente.nome_completo }}
          </option>
        </select>
      </div>

      <!-- Descrição -->
      <div class="col-span-2 flex w-full gap-4">
        <textarea
          v-model="projetoLocal.descricao"
          class="flex-[2] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Descrição *"
          rows="3"
        ></textarea>
      </div>

      <!-- Datas -->
      <div class="col-span-2 flex w-full gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-primary mb-1"
            >Data de Início *</label
          >
          <input
            v-model="projetoLocal.dataInicio"
            type="date"
            class="w-full border border-amber-700 rounded px-4 py-2 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            required
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-primary mb-1"
            >Data Fim Prevista *</label
          >
          <input
            v-model="projetoLocal.dataFimPrevista"
            type="date"
            class="w-full border border-amber-700 rounded px-4 py-2 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            required
          />
        </div>
      </div>

      <!-- Subprojetos -->
      <div class="col-span-2">
        <div class="flex justify-between items-center mb-2">
          <label class="text-sm font-semibold text-primary">Subprojetos</label>
          <button
            type="button"
            @click="adicionarSubprojeto"
            class="text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700 text-xs"
          >
            Adicionar Subprojeto
          </button>
        </div>

        <div
          v-for="(subprojeto, subIndex) in subprojetosSelecionados"
          :key="subIndex"
          class="border border-amber-300 rounded p-3 mb-3 bg-amber-50"
        >
          <div class="flex gap-2 items-start mb-2">
            <select
              v-model="subprojeto.subprojetoId"
              @change="
                carregarTarefasDoSubprojeto(subprojeto.subprojetoId, subIndex)
              "
              class="flex-1 border border-amber-700 rounded px-2 py-1 text-sm"
            >
              <option value="">Selecione um subprojeto</option>
              <option
                v-for="sub in subprojetosDisponiveis"
                :key="sub._id"
                :value="sub._id"
              >
                {{ sub.nome }}
              </option>
            </select>
            <button
              type="button"
              @click="removerSubprojeto(subIndex)"
              class="text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-xs"
            >
              Remover
            </button>
          </div>

          <!-- Tarefas do Subprojeto -->
          <div
            v-if="subprojeto.tarefas && subprojeto.tarefas.length > 0"
            class="ml-4"
          >
            <div class="mb-2">
              <span class="text-xs font-medium text-primary"
                >Tarefas Vinculadas</span
              >
            </div>

            <div
              v-for="(tarefa, tarefaIndex) in subprojeto.tarefas"
              :key="tarefaIndex"
              class="border border-blue-200 rounded p-2 mb-2 bg-blue-50"
            >
              <div class="mb-2">
                <label class="block text-xs font-medium text-primary"
                  >Tarefa</label
                >
                <input
                  :value="tarefa.tarefaNome"
                  type="text"
                  class="w-full border border-blue-300 rounded px-2 py-1 text-xs bg-gray-100"
                  readonly
                />
              </div>

              <div class="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label class="block text-xs text-primary">Data Início</label>
                  <input
                    v-model="tarefa.dataInicio"
                    type="date"
                    class="w-full border border-blue-300 rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label class="block text-xs text-primary"
                    >Data Fim Prevista</label
                  >
                  <input
                    v-model="tarefa.dataFimPrevista"
                    type="date"
                    class="w-full border border-blue-300 rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label class="block text-xs text-primary"
                    >Data Fim Real (opcional)</label
                  >
                  <input
                    v-model="tarefa.dataFimReal"
                    type="date"
                    class="w-full border border-blue-300 rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label class="block text-xs text-primary">Status</label>
                  <select
                    v-model="tarefa.status"
                    class="w-full border border-blue-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="NAO_INICIADA">Não Iniciada</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="ATRASADA">Atrasada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
              </div>

              <!-- Observações -->
              <div>
                <label class="block text-xs text-primary mb-1">Observações</label>
                <textarea
                  v-model="tarefa.observacoes"
                  class="w-full border border-blue-300 rounded px-2 py-1 text-xs"
                  rows="2"
                  placeholder="Observações sobre a tarefa (opcional)"
                ></textarea>
              </div>
            </div>
          </div>

          <div
            v-else-if="subprojeto.subprojetoId"
            class="ml-4 text-xs text-gray-500"
          >
            Nenhuma tarefa encontrada para este subprojeto.
          </div>
        </div>
      </div>
    </form>
  </BaseModal>

  <MensagemNotificacao
    :visible="showNotification"
    :type="notificationType"
    :message="notificationMessage"
    @close="showNotification.value = false"
  />
</template>
