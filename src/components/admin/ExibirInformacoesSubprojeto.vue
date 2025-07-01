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
  notificationMessage.value = "Subprojeto atualizado com sucesso!";
  showNotification.value = true;
};

const showError = () => {
  notificationType.value = "error";
  notificationMessage.value = "Erro ao atualizar o subprojeto!";
  showNotification.value = true;
  isModalOpen.value = false;
};

const props = defineProps({
  subprojeto: {
    type: Object,
    required: true,
  },
});

const subprojetoLocal = ref({
  ...props.subprojeto,
});

watch(
  () => props.subprojeto,
  (novo) => {
    subprojetoLocal.value = {
      ...novo,
    };
  },
  { deep: true }
);

const emit = defineEmits(["subprojetoAtualizado", "subprojetoExcluido"]);

const isModalOpen = ref(false);
const isTarefasModalOpen = ref(false); // Modal visibility for tasks
const isVerTarefasModalOpen = ref(false); // Modal visibility for "Ver Tarefas"
const tarefasSubprojeto = ref([]); // Tasks of the subproject
const tarefasDisponiveis = ref([]); // Array to store all available tasks
const tarefasVinculadas = ref([]); // Array to store tasks linked to the subproject
const tarefasNaoVinculadas = ref([]); // Array to store tasks not linked to the subproject
const tarefasDetalhes = ref([]); // Array to store task details

const carregarTarefas = async () => {
  try {
    const response = await fetch(`${API_URL}/tarefas`);
    if (!response.ok) throw new Error("Erro ao carregar tarefas");

    const data = await response.json();
    tarefasDisponiveis.value = data;
    console.log("Tarefas carregadas:", data);
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
  }
};

const carregarTarefasVinculadas = () => {
  tarefasVinculadas.value = tarefasDisponiveis.value.filter((tarefa) =>
    subprojetoLocal.value.tarefas.includes(tarefa._id)
  );
};

const carregarTarefasNaoVinculadas = () => {
  tarefasNaoVinculadas.value = tarefasDisponiveis.value.filter(
    (tarefa) => !subprojetoLocal.value.tarefas.includes(tarefa._id)
  );
};

const openEditarModal = async () => {
  isModalOpen.value = true;
  subprojetoLocal.value = {
    ...props.subprojeto,
  };

  await carregarTarefas(); // Load all tasks
  subprojetoLocal.value.tarefas = props.subprojeto.tarefas.map(
    (tarefa) => tarefa._id || tarefa // Ensure task IDs are correctly mapped
  ); // Initialize selected tasks
  carregarTarefasVinculadas(); // Filter tasks linked to the subproject
  carregarTarefasNaoVinculadas(); // Filter tasks not linked to the subproject
};

const openDescricaoModal = () => {
  mostrarAlertaInfo(
    "Descrição do subprojeto",
    subprojetoLocal.value.descricao || "Nenhuma descrição fornecida."
  );
};

const openTarefasModal = async () => {
  if (tarefasDisponiveis.value.length === 0) {
    await carregarTarefas(); // Ensure tasks are loaded if not already
  }
  carregarTarefasNaoVinculadas(); // Ensure non-linked tasks are filtered
  isTarefasModalOpen.value = true; // Open the correct modal for viewing tasks
};

const openVerTarefasModal = async () => {
  try {
    tarefasDetalhes.value = await Promise.all(
      subprojetoLocal.value.tarefas.map(async (tarefa) => {
        const tarefaId = typeof tarefa === "object" ? tarefa._id : tarefa; // Ensure we get the ID
        const response = await fetch(`${API_URL}/tarefas/${tarefaId}`);
        if (!response.ok)
          throw new Error("Erro ao carregar detalhes da tarefa");
        return await response.json();
      })
    );
    isVerTarefasModalOpen.value = true; // Open the modal
  } catch (error) {
    console.error("Erro ao carregar tarefas vinculadas:", error);
    mostrarAlertaErro(
      "Erro",
      "Não foi possível carregar as tarefas vinculadas."
    );
  }
};

const atualizarSubprojeto = async () => {
  const s = subprojetoLocal.value;

  if (s.nome === "" || s.descricao === "" || s.tarefas == []) {
    mostrarAlertaErro("Erro", "Preencha todos os campos obrigatórios.");
    return;
  }

  console.log("Subprojeto a ser atualizado:", s);

  try {
    const response = await fetch(`${API_URL}/subprojetos/${s._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...s,
      }),
    });

    if (!response.ok) throw new Error("Erro ao atualizar subprojeto");

    const data = await response.json();
    emit("subprojetoAtualizado", s);
    console.log("Subprojeto atualizada:", data);

    isModalOpen.value = false;
    showSuccess();
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  } catch (error) {
    console.error("Erro ao atualizar subprojeto:", error);
    showError();
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  }
};

const excluirSubprojeto = async (id) => {
  const resultConfirm = await mostrarAlertaAtencao(
    "Atenção",
    "Você tem certeza que deseja excluir essa subprojeto?"
  );
  if (!resultConfirm.isConfirmed) return;

  if (!id) {
    mostrarAlertaErro("Erro", "ID da subprojeto não encontrada.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/subprojetos/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao excluir subprojeto");

    console.log("Subprojeto excluído:", id);
    emit("subprojetoExcluido", id);
  } catch (error) {
    console.error("Erro ao excluir subprojeto:", error);
    notificationType.value = "error";
    notificationMessage.value = "Erro ao excluir o subprojeto!";
    showNotification.value = true;

    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  }
};

const closeEditarModal = () => {
  isModalOpen.value = false; // Close the "Editar Subprojeto" modal
};

const closeTarefasModal = () => {
  isTarefasModalOpen.value = false; // Close the "Ver Tarefas" modal
};

const closeVerTarefasModal = () => {
  isVerTarefasModalOpen.value = false; // Close the "Ver Tarefas" modal
};
</script>

<template>
  <ul
    class="flex justify-between mt-2 text-gray-800 border-t pt-2 items-center"
  >
    <li class="basis-3/5 text-primary font-semibold">
      {{ props.subprojeto.nome }}
    </li>

    <li class="basis-2/5">
      <button
        @click="openVerTarefasModal"
        class="text-white bg-[#10B981] font-medium px-4 py-1 rounded transition-all duration-300 hover:bg-green-100 hover:text-green-700 hover:scale-105"
      >
        Ver Tarefas
      </button>
    </li>

    <li class="basis-2/5">
      <div class="flex gap-2">
        <button
          @click="openDescricaoModal"
          class="text-white bg-[#3B82F6] font-medium px-4 py-1 rounded transition-all duration-300 hover:bg-blue-100 hover:text-blue-700 hover:scale-105"
        >
          Descrição
        </button>
        <button
          @click="openEditarModal"
          class="text-white bg-[#D97706] font-medium px-4 py-1 rounded transition-all duration-300 hover:bg-orange-100 hover:text-orange-700 hover:scale-105"
        >
          Editar
        </button>
        <button
          @click="excluirSubprojeto(subprojetoLocal._id)"
          class="text-white bg-[#B91C1C] font-medium px-4 py-1 rounded transition-all duration-300 hover:bg-red-100 hover:text-red-700 hover:scale-105"
        >
          Excluir
        </button>
      </div>
    </li>
  </ul>

  <BaseModal
    :visible="isModalOpen"
    title="Atualizar Subprojeto"
    confirm-text="Salvar"
    @close="closeEditarModal"
    @confirm="
      () => {
        atualizarSubprojeto();
        isModalOpen = false;
      }
    "
  >
    <!-- Formulário da Subprojeto -->
    <form class="grid grid-cols-2 gap-4">
      <div class="col-span-2 flex w-full gap-4">
        <input
          v-model="subprojetoLocal.nome"
          type="text"
          class="flex-[1.5] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Nome do subprojeto"
        />
      </div>

      <div class="col-span-2 flex w-full gap-4">
        <input
          v-model="subprojetoLocal.descricao"
          type="text"
          class="flex-[2] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Descrição"
        />
      </div>

      <div class="col-span-2">
        <p class="text-sm font-semibold text-primary mb-2">
          Tarefas vinculadas:
        </p>
        <div
          class="max-h-40 overflow-y-auto border border-amber-700 rounded p-2 bg-primary bg-opacity-5 flex flex-col gap-2"
        >
          <div
            v-for="tarefa in tarefasVinculadas"
            :key="tarefa._id"
            class="flex items-center justify-between gap-4 p-2 bg-white rounded shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                :value="tarefa._id"
                v-model="subprojetoLocal.tarefas"
                class="form-checkbox text-primary focus:ring-primary"
              />
              <label class="text-sm text-primary font-medium">{{
                tarefa.nome
              }}</label>
            </div>
            <button
              type="button"
              @click="
                mostrarAlertaInfo(
                  'Descrição da Tarefa',
                  tarefa.descricao || 'Sem descrição disponível.'
                )
              "
              class="text-xs text-white bg-primary px-3 py-1 rounded-full shadow hover:bg-primary-dark transition-colors"
            >
              Ver Descrição
            </button>
          </div>
        </div>
        <button
          type="button"
          @click="
            carregarTarefasNaoVinculadas();
            isTarefasModalOpen = true;
          "
          class="mt-4 flex items-center gap-2 text-white bg-green-500 px-4 py-2 rounded-full shadow hover:bg-green-600 transition-colors"
        >
          <span class="text-lg font-bold">+</span> Adicionar Tarefas
        </button>
      </div>
    </form>
  </BaseModal>

  <BaseModal
    :visible="isTarefasModalOpen"
    title="Adicionar Tarefas ao Subprojeto"
    confirm-text="Fechar"
    @close="closeTarefasModal"
    @confirm="closeTarefasModal"
  >
    <div class="space-y-4">
      <div
        v-for="tarefa in tarefasNaoVinculadas"
        :key="tarefa._id"
        class="p-4 bg-white rounded shadow-md hover:shadow-lg transition-shadow"
      >
        <h3 class="text-lg font-semibold text-primary">{{ tarefa.nome }}</h3>
        <p class="text-sm text-gray-600 mt-2">
          {{ tarefa.descricao || "Sem descrição disponível." }}
        </p>
        <button
          type="button"
          @click="
            subprojetoLocal.tarefas.push(tarefa._id);
            carregarTarefasNaoVinculadas();
            carregarTarefasVinculadas();
          "
          class="mt-2 text-white bg-green-500 px-4 py-2 rounded-full shadow hover:bg-green-600 transition-colors"
        >
          Adicionar
        </button>
      </div>
    </div>
  </BaseModal>

  <BaseModal
    :visible="isVerTarefasModalOpen"
    title="Tarefas Vinculadas"
    confirm-text="Fechar"
    @close="closeVerTarefasModal"
    @confirm="closeVerTarefasModal"
  >
    <div class="space-y-4">
      <div
        v-for="tarefa in tarefasDetalhes"
        :key="tarefa._id"
        class="p-4 bg-white rounded shadow-md hover:shadow-lg transition-shadow"
      >
        <h3 class="text-lg font-semibold text-primary">{{ tarefa.nome }}</h3>
        <p class="text-sm text-gray-600 mt-2">
          {{ tarefa.descricao || "Sem descrição disponível." }}
        </p>
      </div>
    </div>
  </BaseModal>

  <MensagemNotificacao
    :visible="showNotification"
    :type="notificationType"
    :message="notificationMessage"
    @close="showNotification.value = false"
  />
</template>
