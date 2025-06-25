<script setup>
import { ref, onMounted } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { API_URL } from "../../utils/apiUrl.js";
import { mostrarAlertaErro, mostrarAlertaInfo } from "@/utils/utilitarios.js";
import MensagemNotificacao from "@/components/MensagemNotificacao.vue";
import ExibirInformacoesSubprojeto from "@/components/admin/ExibirInformacoesSubprojeto.vue";

const showNotification = ref(false);
const notificationType = ref("success");
const notificationMessage = ref("");

const showSuccess = (text) => {
  notificationType.value = "success";
  notificationMessage.value = text ? text : "Subprojeto criado com sucesso!";
  showNotification.value = true;
};

const showError = (message) => {
  notificationType.value = "error";
  notificationMessage.value = message ? message : "Erro ao criar o subprojeto!";
  showNotification.value = true;
  isModalOpen.value = false;
};

const isModalOpen = ref(false);

const subprojetos = ref([]);

const subprojeto = ref({
  nome: "",
  descricao: "",
  tarefas: [],
});

const tarefasDisponiveis = ref([]); // Array to store available tasks
const tarefasSelecionadas = ref([]); // Array to store selected tasks

const carregarSubprojetos = async () => {
  try {
    const response = await fetch(`${API_URL}/subprojetos`);
    if (!response.ok) throw new Error("Erro ao carregar subprojetos");

    const data = await response.json();
    subprojetos.value = data;
    console.log("Subprojetos carregados:", data);
  } catch (error) {
    console.error("Erro ao carregar subprojetos:", error);
  }
};

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

const pesquisarSubprojetos = async (query) => {
  if (!query.trim()) {
    await carregarSubprojetos();
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/subprojetos/buscar?nome=${encodeURIComponent(query.trim())}`
    );

    if (!response.ok) {
      throw new Error(`Erro ao pesquisar subprojetos: ${response.statusText}`);
    }

    const data = await response.json();

    subprojetos.value = data.subprojetos;

    console.log("Subprojetos encontradas:", data.subprojetos);
  } catch (error) {
    console.error("Erro ao pesquisar subprojetos:", error.message);
    mostrarAlertaErro(
      "Erro",
      "Não foi possível realizar a pesquisa. Tente novamente."
    );
  }
};

const salvarSubprojeto = async () => {
  const s = subprojeto.value;

  if (!s.nome || !s.descricao || tarefasSelecionadas.value.length === 0) {
    mostrarAlertaErro("Erro", "Preencha todos os campos obrigatórios.");
    return;
  }

  s.tarefas = tarefasSelecionadas.value; // Assign selected tasks to the subproject

  try {
    const response = await fetch(`${API_URL}/subprojetos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(s),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao salvar subprojeto");
    }

    const data = await response.json();
    console.log("Subprojeto salvo:", data);

    isModalOpen.value = false;
    showSuccess();
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);

    subprojeto.value = {
      nome: "",
      descricao: "",
      tarefas: [],
    };

    carregarSubprojetos();
  } catch (error) {
    showError(error.message);
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
    console.error("Erro ao salvar subprojeto:", error);
  }
};

const handleSubprojetoAtualizado = (subprojetoAtualizado) => {
  const index = subprojetos.value.findIndex(
    (t) => t._id === subprojetoAtualizado._id
  );
  if (index !== -1) {
    subprojetos.value[index] = subprojetoAtualizado;
    subprojetos.value = [...subprojetos.value];
  }
};

const handleSubprojetoExcluido = (id) => {
  const index = subprojetos.value.findIndex((t) => t._id === id);
  if (index !== -1) {
    subprojetos.value.splice(index, 1);
    subprojetos.value = [...subprojetos.value];
  }
  showSuccess("Subprojeto excluído com sucesso!");
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

const exibirDescricaoTarefa = (descricao) => {
  mostrarAlertaInfo(
    "Descrição da Tarefa",
    descricao || "Sem descrição disponível."
  );
};

onMounted(() => {
  carregarSubprojetos();
  carregarTarefas(); // Load tasks when the component is mounted
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
      NOVO SUBPROJETO
    </button>

    <div class="bg-white w-[90%] mt-10 rounded-lg shadow-md p-5">
      <div class="flex justify-between">
        <p class="text-2xl text-primary font-semibold">
          {{ subprojetos.length }} resultados encontrados
        </p>
        <div class="relative w-full max-w-sm">
          <img
            src="../../components/icons/lupa.svg"
            alt="Lupa"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
          />
          <input
            @input="pesquisarSubprojetos($event.target.value)"
            type="text"
            placeholder="Pesquisar subprojeto"
            class="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-es-xl focus:outline-primary focus:ring-0 focus:ring-primary-500"
          />
        </div>
      </div>
      <div>
        <ul class="flex justify-between mt-10 text-primary opacity-50">
          <li class="basis-3/5">Nome</li>
          <li class="basis-2/5">Tarefas</li>
          <li class="basis-2/5">Ações</li>
        </ul>
      </div>

      <ExibirInformacoesSubprojeto
        v-if="subprojetos.length > 0"
        v-for="subprojeto in subprojetos"
        :key="subprojeto._id"
        :subprojeto="subprojeto"
        @subprojetoAtualizado="handleSubprojetoAtualizado"
        @subprojetoExcluido="handleSubprojetoExcluido"
      />

      <div
        v-if="subprojetos.length === 0"
        class="flex flex-col items-center justify-center h-64 mt-10 gap-4"
      >
        <img class="h-4/5" src="../../components/icons/not-found.svg" alt="" />
        <p class="text-primary font-semibold">Nenhum subprojeto encontrado.</p>
      </div>
    </div>

    <BaseModal
      :visible="isModalOpen"
      title="Cadastrar Subprojeto"
      confirm-text="Salvar"
      @close="isModalOpen = false"
      @confirm="salvarSubprojeto"
    >
      <!-- Formulário da Subprojeto -->
      <form class="grid grid-cols-2 gap-4">
        <div class="col-span-2 flex w-full gap-4">
          <input
            v-model="subprojeto.nome"
            type="text"
            class="flex-[1.5] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Nome do subprojeto *"
            required
          />
        </div>

        <div class="col-span-2 flex w-full gap-4">
          <input
            v-model="subprojeto.descricao"
            type="text"
            class="flex-[2] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Descrição *"
          />
        </div>

        <div class="col-span-2">
          <p class="text-sm font-semibold text-primary mb-2">
            Selecione as tarefas:
          </p>
          <div
            class="max-h-40 overflow-y-auto border border-amber-700 rounded p-2 bg-primary bg-opacity-5 flex flex-col gap-2"
          >
            <div
              v-for="tarefa in tarefasDisponiveis"
              :key="tarefa._id"
              class="flex items-center justify-between gap-4 p-2 bg-white rounded shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  :value="tarefa._id"
                  v-model="tarefasSelecionadas"
                  class="form-checkbox text-primary focus:ring-primary"
                />
                <label class="text-sm text-primary font-medium">{{
                  tarefa.nome
                }}</label>
              </div>
              <button
                type="button"
                @click="exibirDescricaoTarefa(tarefa.descricao)"
                class="text-xs text-white bg-primary px-3 py-1 rounded-full shadow hover:bg-primary-dark transition-colors"
              >
                Ver Descrição
              </button>
            </div>
          </div>
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
