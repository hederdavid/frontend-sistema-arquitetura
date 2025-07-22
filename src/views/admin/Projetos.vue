<script setup>
import { ref, onMounted } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { API_URL } from "../../utils/apiUrl.js";
import { mostrarAlertaErro } from "@/utils/utilitarios.js";
import MensagemNotificacao from "@/components/MensagemNotificacao.vue";
import ExibirInformacoesProjeto from "@/components/admin/ExibirInformacoesProjeto.vue";

const showNotification = ref(false);
const notificationType = ref("success");
const notificationMessage = ref("");

const showSuccess = (text) => {
  notificationType.value = "success";
  notificationMessage.value = text ? text : "Projeto criado com sucesso!";
  showNotification.value = true;
};

const showError = (message) => {
  notificationType.value = "error";
  notificationMessage.value = message ? message : "Erro ao criar o projeto!";
  showNotification.value = true;
  isModalOpen.value = false;
};

const isModalOpen = ref(false);

const projetos = ref([]);

const projeto = ref({
  nome: "",
  descricao: "",
  clienteId: "",
  dataInicio: "",
  dataFimPrevista: "",
  subprojetos: [],
});

const clientes = ref([]);
const subprojetosDisponiveis = ref([]);
const tarefasDisponiveis = ref([]);
const subprojetosSelecionados = ref([]);

const carregarProjetos = async () => {
  try {
    const response = await fetch(`${API_URL}/projetos`);
    if (!response.ok) throw new Error("Erro ao carregar projetos");

    const data = await response.json();
    projetos.value = data;
    console.log("Projetos carregados:", data);
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
  }
};

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

const carregarTarefas = async () => {
  try {
    const response = await fetch(`${API_URL}/tarefas`);
    if (!response.ok) throw new Error("Erro ao carregar tarefas");
    const data = await response.json();
    tarefasDisponiveis.value = data;
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
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

    // Mapear as tarefas do subprojeto para o formato necessário
    subprojetosSelecionados.value[subprojetoIndex].tarefas =
      subprojeto.tarefas.map((tarefa) => ({
        tarefaId: typeof tarefa === "object" ? tarefa._id : tarefa,
        tarefaNome: typeof tarefa === "object" ? tarefa.nome : "",
        dataInicio: "",
        dataFimPrevista: "",
        dataFimReal: "",
        status: "NAO_INICIADA",
      }));

    // Se as tarefas são apenas IDs, buscar os detalhes
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

const salvarProjeto = async () => {
  const p = {
    ...projeto.value,
    subprojetos: subprojetosSelecionados.value.filter(
      (sub) => sub.subprojetoId && sub.tarefas.length > 0
    ),
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
    const response = await fetch(`${API_URL}/projetos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(p),
    });

    console.log("Enviando projeto:", JSON.stringify(p));

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao salvar projeto");
    }

    const data = await response.json();
    console.log("Projeto salva:", data);

    isModalOpen.value = false;
    showSuccess();
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);

    projeto.value = {
      nome: "",
      descricao: "",
      clienteId: "",
      dataInicio: "",
      dataFimPrevista: "",
      subprojetos: [],
      status: "",
    };

    carregarProjetos();
  } catch (error) {
    showError(error.message);
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
    console.error("Erro ao salvar projeto:", error);
  }
};

const handleProjetoAtualizado = (projetoAtualizado) => {
  const index = projetos.value.findIndex(
    (p) => p._id === projetoAtualizado._id
  );
  if (index !== -1) {
    projetos.value[index] = projetoAtualizado;
    projetos.value = [...projetos.value];
  }
};

const handleProjetoExcluido = (id) => {
  const index = projetos.value.findIndex((p) => p._id === id);
  if (index !== -1) {
    projetos.value.splice(index, 1);
    projetos.value = [...projetos.value];
  }
  showSuccess("Projeto excluída com sucesso!");
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

onMounted(() => {
  carregarProjetos();
  carregarClientes();
  carregarSubprojetos();
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
      NOVO PROJETO
    </button>

    <div class="bg-white w-[90%] mt-10 rounded-lg shadow-md p-5">
      <div class="flex justify-between">
        <p class="text-2xl text-primary font-semibold">
          {{ projetos.length }} resultados encontrados
        </p>
        <div class="relative w-full max-w-sm">
          <img
            src="../../components/icons/lupa.svg"
            alt="Lupa"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
          />
          <input
            @input="pesquisarProjetos($event.target.value)"
            type="text"
            placeholder="Pesquisar projeto"
            class="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-es-xl focus:outline-primary focus:ring-0 focus:ring-primary-500"
          />
        </div>
      </div>

      <ExibirInformacoesProjeto
        v-if="projetos.length > 0"
        v-for="projeto in projetos"
        :key="projeto._id"
        :projeto="projeto"
        @projetoAtualizado="handleProjetoAtualizado"
        @projetoExcluido="handleProjetoExcluido"
      />

      <div
        v-if="projetos.length === 0"
        class="flex flex-col items-center justify-center h-64 mt-10 gap-4"
      >
        <img class="h-4/5" src="../../components/icons/not-found.svg" alt="" />
        <p class="text-primary font-semibold">Nenhum projeto encontrado.</p>
      </div>
    </div>

    <BaseModal
      :visible="isModalOpen"
      title="Cadastrar Projeto"
      confirm-text="Salvar"
      @close="isModalOpen = false"
      @confirm="salvarProjeto"
    >
      <form class="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        <!-- Nome e Cliente -->
        <div class="col-span-2 flex w-full gap-4">
          <input
            v-model="projeto.nome"
            type="text"
            class="flex-[1.5] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Nome do projeto *"
            required
          />
          <select
            v-model="projeto.clienteId"
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
            v-model="projeto.descricao"
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
              v-model="projeto.dataInicio"
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
              v-model="projeto.dataFimPrevista"
              type="date"
              class="w-full border border-amber-700 rounded px-4 py-2 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
              required
            />
          </div>
        </div>

        <!-- Subprojetos -->
        <div class="col-span-2">
          <div class="flex justify-between items-center mb-2">
            <label class="text-sm font-semibold text-primary"
              >Subprojetos</label
            >
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
                <!-- Nome da tarefa (somente leitura) -->
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
                    <label class="block text-xs text-primary"
                      >Data Início</label
                    >
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
                      <option value="NAO_INICIADA">Não Iniciado</option>
                      <option value="EM_ANDAMENTO">Em Andamento</option>
                      <option value="CONCLUIDA">Concluído</option>
                      <option value="ATRASADA">Atrasada</option>
                      <option value="CANCELADA">Cancelado</option>
                    </select>
                  </div>
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
      @close="showNotification = false"
    />
  </div>
</template>
