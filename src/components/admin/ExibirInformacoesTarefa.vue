<script setup>
import { ref, watch } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { API_URL } from "../../utils/apiUrl.js";
import { buscarEndereco } from "@/utils/buscarEnderecoApi.js";
import { validarEmail, validarCPF, validarCNPJ } from "@/utils/validacoes.js";
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
  notificationMessage.value = "Tarefa atualizada com sucesso!";
  showNotification.value = true;
};

const showError = () => {
  notificationType.value = "error";
  notificationMessage.value = "Erro ao atualizar o tarefa!";
  showNotification.value = true;
  isModalOpen.value = false;
};

const props = defineProps({
  tarefa: {
    type: Object,
    required: true,
  },
});

const tarefaLocal = ref({
  ...props.tarefa,
});

watch(
  () => props.tarefa,
  (novo) => {
    tarefaLocal.value = {
      ...novo,
    };
  },
  { deep: true }
);

const emit = defineEmits(["tarefaAtualizada", "tarefaExcluida"]);

const isModalOpen = ref(false);

const openEditarModal = () => {
  isModalOpen.value = true;
  tarefaLocal.value = {
    ...props.tarefa,
  };
};

const openDescricaoModal = () => {
  mostrarAlertaInfo(
    "Descrição da Tarefa",
    tarefaLocal.value.descricao || "Nenhuma descrição fornecida."
  );
}

const atualizarTarefa = async () => {
  const t = tarefaLocal.value;

  if (
    t.nome === "" ||
    t.descricao === "" ||
    t.status === ""
  ) {
    mostrarAlertaErro("Erro", "Preencha todos os campos obrigatórios.");
    return;
  }

  console.log("Tarefa a ser atualizada:", t);

  try {
    const response = await fetch(`${API_URL}/tarefas/${t._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...t,
      }),
    });

    if (!response.ok) throw new Error("Erro ao atualizar tarefa");

    const data = await response.json();
    emit("tarefaAtualizada", t);
    console.log("Tarefa atualizada:", data);

    isModalOpen.value = false;
    showSuccess();
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    showError();
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  }
};

const excluirTarefa = async (id) => {
  const resultConfirm = await mostrarAlertaAtencao(
    "Atenção",
    "Você tem certeza que deseja excluir essa tarefa?"
  );
  if (!resultConfirm.isConfirmed) return;

  if (!id) {
    mostrarAlertaErro("Erro", "ID da tarefa não encontrada.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tarefas/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao excluir tarefa");

    console.log("Tarefa excluída:", id);
    emit("tarefaExcluida", id);
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    notificationType.value = "error";
    notificationMessage.value = "Erro ao excluir a tarefa!";
    showNotification.value = true;

    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
  }
};
</script>

<template>
  <ul
    class="flex justify-between mt-2 text-gray-800 border-t pt-2 items-center"
  >
    <li class="basis-3/5 text-primary font-semibold">
      {{ props.tarefa.nome }}
    </li>

    <li class="basis-1/5 text-primary font-semibold">
      {{ props.tarefa.status }}
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
          @click="excluirTarefa(tarefaLocal._id)"
          class="text-white bg-[#B91C1C] font-medium px-4 py-1 rounded transition-all duration-300 hover:bg-red-100 hover:text-red-700 hover:scale-105"
        >
          Excluir
        </button>
      </div>
    </li>
  </ul>
  <BaseModal
    :visible="isModalOpen"
    title="Atualizar Tarefa"
    confirm-text="Salvar"
    @close="isModalOpen = false"
    @confirm="atualizarTarefa"
  >
    <!-- Formulário da Tarefa -->
    <form class="grid grid-cols-2 gap-4">
      <div class="col-span-2 flex w-full gap-4">
        <input
          v-model="tarefaLocal.nome"
          type="text"
          class="flex-[1.5] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Nome da tarefa"
        />
        <input
          v-model="tarefaLocal.status"
          type="text"
          class="flex-[1] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="status"
        />
      </div>

      <div class="col-span-2 flex w-full gap-4">
        <input
          v-model="tarefaLocal.descricao"
          type="email"
          class="flex-[2] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Descrição"
        />
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