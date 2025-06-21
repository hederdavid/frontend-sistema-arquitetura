<script setup>
import { ref, onMounted } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { API_URL } from "../../utils/apiUrl.js";
import { buscarEndereco } from "@/utils/buscarEnderecoApi.js";
import { validarEmail, validarCPF, validarCNPJ } from "@/utils/validacoes.js";
import { mostrarAlertaErro } from "@/utils/utilitarios.js";
import MensagemNotificacao from "@/components/MensagemNotificacao.vue";
import ExibirInformacoesTarefa from "@/components/admin/ExibirInformacoesTarefa.vue";

const showNotification = ref(false);
const notificationType = ref("success");
const notificationMessage = ref("");

const showSuccess = (text) => {
  notificationType.value = "success";
  notificationMessage.value =  text ? text : "Tarefa criada com sucesso!";
  showNotification.value = true;
};

const showError = (message) => {
  notificationType.value = "error";
  notificationMessage.value = message ? message : "Erro ao criar o tarefa!";
  showNotification.value = true;
  isModalOpen.value = false;
};

const isModalOpen = ref(false);

const tarefas = ref([]);

const tarefa = ref({
  nome: "",
  descricao: "",
  status: "",
});

const carregarTarefas = async () => {
  try {
    const response = await fetch(`${API_URL}/tarefas`);
    if (!response.ok) throw new Error("Erro ao carregar tarefas");

    const data = await response.json();
    tarefas.value = data;
    console.log("Tarefas carregados:", data);
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
  }
};

const pesquisarTarefas = async (query) => {
  if (!query.trim()) {
    await carregarTarefas();
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/tarefas/buscar?nome=${encodeURIComponent(query.trim())}`
    );

    if (!response.ok) {
      throw new Error(`Erro ao pesquisar tarefas: ${response.statusText}`);
    }

    const data = await response.json();

    tarefas.value = data.tarefas;

    console.log("Tarefas encontradas:", data.tarefas);
  } catch (error) {
    console.error("Erro ao pesquisar tarefas:", error.message);
    mostrarAlertaErro(
      "Erro",
      "Não foi possível realizar a pesquisa. Tente novamente."
    );
  }
};

const salvarTarefa = async () => {
  const t = tarefa.value;

  if (
    !t.nome ||
    !t.descricao ||
    !t.status
  ) {
    mostrarAlertaErro("Erro", "Preencha todos os campos obrigatórios.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tarefas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(t),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao salvar tarefa");
    }

    const data = await response.json();
    console.log("Tarefa salva:", data);

    isModalOpen.value = false;
    showSuccess();
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);

    tarefa.value = {
      nome: "",
      descricao: "",
      status: "",
    };

    carregarTarefas();
  } catch (error) {
    showError(error.message);
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
    console.error("Erro ao salvar tarefa:", error);
  }
};

const handleTarefaAtualizada = (tarefaAtualizada) => {
  const index = tarefas.value.findIndex(
    (t) => t._id === tarefaAtualizada._id
  );
  if (index !== -1) {
    tarefas.value[index] = tarefaAtualizada;
    tarefas.value = [...tarefas.value];
  }
};

const handleTarefaExcluida = (id) => {
  const index = tarefas.value.findIndex((t) => t._id === id);
  if (index !== -1) {
    tarefas.value.splice(index, 1);
    tarefas.value = [...tarefas.value];
  }
  showSuccess("Tarefa excluída com sucesso!");
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

onMounted(() => {
  carregarTarefas();
});
</script>

<template>
  <div
    class="flex flex-col h-screen font-sans bg-pale-rose bg-opacity-30 items-center"
  >
    <button
      @click="isModalOpen = true"
      class="font-semibold tracking-widest flex gap-4 bg-primary self-end text-white px-6 py-3 rounded-full shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      <img src="../../components/icons/add-icone-3.svg" alt="Adicionar" />
      NOVA TAREFA
    </button>

    <div class="bg-white w-[90%] mt-10 rounded-lg shadow-md p-5">
      <div class="flex justify-between">
        <p class="text-2xl text-primary font-semibold">
          {{ tarefas.length }} resultados encontrados
        </p>
        <div class="relative w-full max-w-sm">
          <img
            src="../../components/icons/lupa.svg"
            alt="Lupa"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
          />
          <input
            @input="pesquisarTarefas($event.target.value)"
            type="text"
            placeholder="Pesquisar tarefa"
            class="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-es-xl focus:outline-primary focus:ring-0 focus:ring-primary-500"
          />
        </div>
      </div>
      <div>
        <ul class="flex justify-between mt-10 text-primary opacity-50">
          <li class="basis-3/5">Nome</li>
          <li class="basis-1/5">Status</li>
          <li class="basis-2/5">Ações</li>
        </ul>
      </div>

      <ExibirInformacoesTarefa
        v-if="tarefas.length > 0"
        v-for="tarefa in tarefas"
        :key="tarefa._id"
        :tarefa="tarefa"
        @tarefaAtualizada="handleTarefaAtualizada"
        @tarefaExcluida="handleTarefaExcluida"
      />

      <div v-if="tarefas.length === 0"
       class="flex flex-col items-center justify-center h-64 mt-10 gap-4">
        <img class="h-4/5" src="../../components/icons/not-found.svg" alt="">
        <p class="text-primary font-semibold">Nenhuma tarefa encontrada.</p>
      </div>
      
    </div>

    <BaseModal
      :visible="isModalOpen"
      title="Cadastrar Tarefa"
      confirm-text="Salvar"
      @close="isModalOpen = false"
      @confirm="salvarTarefa"
    >
      <!-- Formulário da Tarefa -->
      <form class="grid grid-cols-2 gap-4">
        <div class="col-span-2 flex w-full gap-4">
          <input
            v-model="tarefa.nome"
            type="text"
            class="flex-[1.5] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Nome da tarefa *"
            required
          />
          <input
            v-model="tarefa.status"
            type="text"
            class="flex-[1] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Status *"
          />
        </div>

        <div class="col-span-2 flex w-full gap-4">
          <input
            v-model="tarefa.descricao"
            type="email"
            class="flex-[2] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Descrição *"
          />
        </div>
      </form>
    </BaseModal>
    <MensagemNotificacao
      :visible="showNotification"
      :type="notificationType"
      :message="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
