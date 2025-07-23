<script setup>
import { onMounted, ref, watch } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { API_URL } from "../../utils/apiUrl.js";
import { defineProps, defineEmits } from "vue";
import {
  mostrarAlertaErro,
  mostrarAlertaAtencao,
  mostrarAlertaInfo,
} from "@/utils/utilitarios.js";
import {
  validarProjetoCompleto,
  sanitizarProjeto,
} from "@/utils/validacoes.js";

import MensagemNotificacao from "@/components/MensagemNotificacao.vue";
const showNotification = ref(false);
const notificationType = ref("success");
const notificationMessage = ref("");

// Variável para garantir chaves únicas para o v-for
let nextSubprojetoKey = 0;

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

// projetoLocal agora armazena IDs como strings para consistência
const projetoLocal = ref({
  ...props.projeto,
  clienteId: props.projeto.clienteId?._id || "",
  dataInicio: props.projeto.dataInicio
    ? props.projeto.dataInicio.split("T")[0]
    : "",
  dataFimPrevista: props.projeto.dataFimPrevista
    ? props.projeto.dataFimPrevista.split("T")[0]
    : "",
});

const clientes = ref([]);
const subprojetosDisponiveis = ref([]);
// subprojetosSelecionados agora armazena IDs como strings
const subprojetosSelecionados = ref([]);

watch(
  () => props.projeto,
  (novo) => {
    projetoLocal.value = {
      ...novo,
      clienteId: novo.clienteId?._id || "",
      dataInicio: novo.dataInicio ? novo.dataInicio.split("T")[0] : "",
      dataFimPrevista: novo.dataFimPrevista
        ? novo.dataFimPrevista.split("T")[0]
        : "",
    };
  },
  { deep: true }
);

const emit = defineEmits(["projetoAtualizado", "projetoExcluido"]);

const isModalOpen = ref(false);

// Estados de validação em tempo real para edição
const editValidationErrors = ref({
  nome: "",
  descricao: "",
  clienteId: "",
  dataInicio: "",
  dataFimPrevista: "",
});

// Função para validar campo individual na edição
const validarCampoEdicao = (campo, valor) => {
  switch (campo) {
    case "nome":
      if (!valor || valor.trim().length === 0) {
        editValidationErrors.value.nome = "Nome é obrigatório";
      } else if (valor.trim().length < 3) {
        editValidationErrors.value.nome =
          "Nome deve ter pelo menos 3 caracteres";
      } else if (valor.trim().length > 100) {
        editValidationErrors.value.nome =
          "Nome deve ter no máximo 100 caracteres";
      } else {
        editValidationErrors.value.nome = "";
      }
      break;

    case "descricao":
      if (!valor || valor.trim().length === 0) {
        editValidationErrors.value.descricao = "Descrição é obrigatória";
      } else if (valor.trim().length < 10) {
        editValidationErrors.value.descricao =
          "Descrição deve ter pelo menos 10 caracteres";
      } else if (valor.trim().length > 1000) {
        editValidationErrors.value.descricao =
          "Descrição deve ter no máximo 1000 caracteres";
      } else {
        editValidationErrors.value.descricao = "";
      }
      break;

    case "clienteId":
      if (!valor || valor.trim().length === 0) {
        editValidationErrors.value.clienteId = "Cliente é obrigatório";
      } else {
        editValidationErrors.value.clienteId = "";
      }
      break;

    case "dataInicio":
      if (!valor) {
        editValidationErrors.value.dataInicio = "Data de início é obrigatória";
      } else {
        const dataInicio = new Date(valor);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (dataInicio < hoje) {
          const diffDays = Math.floor(
            (hoje - dataInicio) / (1000 * 60 * 60 * 24)
          );
          if (diffDays > 1) {
            editValidationErrors.value.dataInicio =
              "Data de início não pode ser muito anterior à data atual";
          } else {
            editValidationErrors.value.dataInicio = "";
          }
        } else {
          editValidationErrors.value.dataInicio = "";
        }

        // Revalidar data fim se já estiver preenchida
        if (projetoLocal.value.dataFimPrevista) {
          validarCampoEdicao(
            "dataFimPrevista",
            projetoLocal.value.dataFimPrevista
          );
        }
      }
      break;

    case "dataFimPrevista":
      if (!valor) {
        editValidationErrors.value.dataFimPrevista =
          "Data fim prevista é obrigatória";
      } else if (projetoLocal.value.dataInicio) {
        const dataInicio = new Date(projetoLocal.value.dataInicio);
        const dataFim = new Date(valor);

        if (dataFim <= dataInicio) {
          editValidationErrors.value.dataFimPrevista =
            "Data fim deve ser posterior à data de início";
        } else {
          const diffTime = Math.abs(dataFim - dataInicio);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 1825) {
            editValidationErrors.value.dataFimPrevista =
              "Duração não pode exceder 5 anos";
          } else {
            editValidationErrors.value.dataFimPrevista = "";
          }
        }
      } else {
        editValidationErrors.value.dataFimPrevista = "";
      }
      break;
  }
};

// Limpar erros de validação na edição
const limparValidacoesEdicao = () => {
  editValidationErrors.value = {
    nome: "",
    descricao: "",
    clienteId: "",
    dataInicio: "",
    dataFimPrevista: "",
  };
};

// Função para fechar modal de edição
const fecharModalEdicao = () => {
  isModalOpen.value = false;
  limparValidacoesEdicao();
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

// CORRIGIDO: Garante que a estrutura da tarefa seja consistente ao carregar.
const carregarTarefasDoSubprojeto = async (subprojetoId, subprojetoIndex) => {
  if (!subprojetoId) {
    subprojetosSelecionados.value[subprojetoIndex].tarefas = [];
    return;
  }

  try {
    const response = await fetch(`${API_URL}/subprojetos/${subprojetoId}`);
    if (!response.ok) throw new Error("Erro ao carregar tarefas do subprojeto");

    const subprojeto = await response.json();
    console.log("Subprojeto carregado:", subprojeto);

    // As tarefas vêm como array de IDs, precisamos buscar os dados completos
    if (subprojeto.tarefas && subprojeto.tarefas.length > 0) {
      const tarefasCompletas = [];

      for (const tarefaId of subprojeto.tarefas) {
        try {
          // Buscar dados completos de cada tarefa
          const tarefaResponse = await fetch(`${API_URL}/tarefas/${tarefaId}`);
          if (tarefaResponse.ok) {
            const tarefaCompleta = await tarefaResponse.json();
            tarefasCompletas.push({
              tarefaId: tarefaCompleta._id,
              tarefaNome: tarefaCompleta.nome || "Tarefa sem nome",
              dataInicio: "",
              dataFimPrevista: "",
              dataFimReal: "",
              status: "NAO_INICIADA",
              observacoes: "",
            });
          } else {
            console.warn(`Erro ao carregar tarefa ${tarefaId}`);
          }
        } catch (error) {
          console.error(`Erro ao buscar tarefa ${tarefaId}:`, error);
        }
      }

      subprojetosSelecionados.value[subprojetoIndex].tarefas = tarefasCompletas;
    } else {
      subprojetosSelecionados.value[subprojetoIndex].tarefas = [];
    }

    console.log(
      "Tarefas após processamento:",
      subprojetosSelecionados.value[subprojetoIndex].tarefas
    );
  } catch (error) {
    console.error("Erro ao carregar tarefas do subprojeto:", error);
    mostrarAlertaErro(
      "Erro",
      "Não foi possível carregar as tarefas do subprojeto."
    );
    subprojetosSelecionados.value[subprojetoIndex].tarefas = [];
  }
};

const adicionarSubprojeto = () => {
  subprojetosSelecionados.value.push({
    key: nextSubprojetoKey++,
    subprojetoId: "",
    tarefas: [],
  });
};

const removerSubprojeto = (index) => {
  subprojetosSelecionados.value.splice(index, 1);
};

const openEditarModal = async () => {
  isModalOpen.value = true;
  limparValidacoesEdicao();

  projetoLocal.value = {
    ...props.projeto,
    clienteId: props.projeto.clienteId?._id,
    dataInicio: props.projeto.dataInicio
      ? props.projeto.dataInicio.split("T")[0]
      : "",
    dataFimPrevista: props.projeto.dataFimPrevista
      ? props.projeto.dataFimPrevista.split("T")[0]
      : "",
  };

  await carregarClientes();
  await carregarSubprojetos();

  const taskNameMap = new Map();
  if (subprojetosDisponiveis.value) {
    subprojetosDisponiveis.value.forEach((sub) => {
      if (sub.tarefas) {
        sub.tarefas.forEach((task) => {
          taskNameMap.set(task._id, task.nome);
        });
      }
    });
  }

  subprojetosSelecionados.value = props.projeto.subprojetos
    ? props.projeto.subprojetos
        .filter((sub) => sub && sub.subprojetoId)
        .map((sub) => ({
          key: nextSubprojetoKey++,
          subprojetoId: sub.subprojetoId._id,
          tarefas: (sub.tarefas || [])
            .filter((tarefa) => tarefa && tarefa.tarefaId)
            .map((tarefa) => {
              const tarefaId = tarefa.tarefaId._id;
              return {
                tarefaId: tarefaId,
                tarefaNome:
                  taskNameMap.get(tarefaId) || "Tarefa não encontrada",
                status: tarefa.status,
                observacoes: tarefa.observacoes || "",
                dataInicio: tarefa.dataInicio
                  ? tarefa.dataInicio.split("T")[0]
                  : "",
                dataFimPrevista: tarefa.dataFimPrevista
                  ? tarefa.dataFimPrevista.split("T")[0]
                  : "",
                dataFimReal: tarefa.dataFimReal
                  ? tarefa.dataFimReal.split("T")[0]
                  : "",
              };
            }),
        }))
    : [];
};

const openDescricaoModal = () => {
  mostrarAlertaInfo(
    "Descrição do Projeto",
    projetoLocal.value.descricao || "Nenhuma descrição fornecida."
  );
};

const atualizarProjeto = async () => {
  // Primeiro, sanitizar os dados
  const projetoSanitizado = sanitizarProjeto({
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
  });

  // Validar o projeto completo
  const resultadoValidacao = validarProjetoCompleto(projetoSanitizado);

  if (!resultadoValidacao.valido) {
    const errosDetalhados = resultadoValidacao.erros.join("\n• ");
    mostrarAlertaErro(
      "Dados inválidos",
      `Por favor, corrija os seguintes erros:\n\n• ${errosDetalhados}`
    );
    return;
  }

  console.log("Projeto a ser atualizado:", projetoSanitizado);

  try {
    const response = await fetch(
      `${API_URL}/projetos/${projetoSanitizado._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projetoSanitizado),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao atualizar projeto");
    }

    const data = await response.json();
    emit("projetoAtualizado", data);
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

onMounted(() => {
  console.log("Props do projeto inicial:", props.projeto);
});

// Funções auxiliares para o novo layout
const formatarData = (data) => {
  if (!data) return "Não definida";

  try {
    const dataFormatada = new Date(data);
    if (isNaN(dataFormatada)) throw new Error("Data inválida");

    return dataFormatada.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
};

const calcularDuracao = (dataInicio, dataFim) => {
  if (!dataInicio || !dataFim) return "Não definida";
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffTime = Math.abs(fim - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays + 1} dias`;
};

const contarTotalTarefas = () => {
  let total = 0;
  if (props.projeto.subprojetos) {
    props.projeto.subprojetos.forEach((sub) => {
      total += sub.tarefas?.length || 0;
    });
  }
  return total;
};

const contarTarefasConcluidas = () => {
  let concluidas = 0;
  if (props.projeto.subprojetos) {
    props.projeto.subprojetos.forEach((sub) => {
      if (sub.tarefas) {
        sub.tarefas.forEach((tarefa) => {
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
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-md border border-gray-200 mb-4 p-6 transition-all duration-300 hover:shadow-lg"
  >
    <!-- Header do Projeto -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <h3 class="text-xl font-bold text-primary mb-2">
          {{ props.projeto.nome }}
        </h3>
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <span class="font-medium">Cliente:</span>
            <span>{{ props.projeto.clienteId?.nome_completo || "N/A" }}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="font-medium">Subprojetos:</span>
            <span
              class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
            >
              {{ props.projeto.subprojetos?.length || 0 }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end gap-2">
        <span
          class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
        >
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
            <span class="font-medium">{{
              formatarData(props.projeto.dataInicio)
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Fim Previsto:</span>
            <span class="font-medium">{{
              formatarData(props.projeto.dataFimPrevista)
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Duração:</span>
            <span class="font-medium">{{
              calcularDuracao(
                props.projeto.dataInicio,
                props.projeto.dataFimPrevista
              )
            }}</span>
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
            <span class="font-medium text-green-600">{{
              contarTarefasConcluidas()
            }}</span>
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
          {{ props.projeto.descricao || "Nenhuma descrição fornecida." }}
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
    <div
      v-if="props.projeto.subprojetos && props.projeto.subprojetos.length > 0"
      class="mb-4"
    >
      <h4 class="font-semibold text-primary text-sm mb-2">🎯 Subprojetos</h4>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(subprojeto, index) in props.projeto.subprojetos.slice(0, 3)"
          :key="index"
          class="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs"
        >
          {{ subprojeto.subprojetoId.nome }}
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
    @close="fecharModalEdicao"
    @confirm="atualizarProjeto"
  >
    <form class="space-y-4 max-h-[70vh] overflow-y-auto p-1">
      <!-- Nome e Cliente -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            v-model="projetoLocal.nome"
            @blur="validarCampoEdicao('nome', projetoLocal.nome)"
            @input="validarCampoEdicao('nome', projetoLocal.nome)"
            type="text"
            class="w-full border rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            :class="
              editValidationErrors.nome ? 'border-red-500' : 'border-amber-700'
            "
            placeholder="Nome do projeto *"
            required
          />
          <p v-if="editValidationErrors.nome" class="text-red-500 text-xs mt-1">
            {{ editValidationErrors.nome }}
          </p>
        </div>

        <div>
          <select
            v-model="projetoLocal.clienteId"
            @change="validarCampoEdicao('clienteId', projetoLocal.clienteId)"
            class="w-full border rounded px-4 py-2 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            :class="
              editValidationErrors.clienteId
                ? 'border-red-500'
                : 'border-amber-700'
            "
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
          <p
            v-if="editValidationErrors.clienteId"
            class="text-red-500 text-xs mt-1"
          >
            {{ editValidationErrors.clienteId }}
          </p>
        </div>
      </div>

      <!-- Descrição -->
      <div>
        <textarea
          v-model="projetoLocal.descricao"
          @blur="validarCampoEdicao('descricao', projetoLocal.descricao)"
          @input="validarCampoEdicao('descricao', projetoLocal.descricao)"
          class="w-full border rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          :class="
            editValidationErrors.descricao
              ? 'border-red-500'
              : 'border-amber-700'
          "
          placeholder="Descrição *"
          rows="3"
        ></textarea>
        <div class="flex justify-between items-center mt-1">
          <p v-if="editValidationErrors.descricao" class="text-red-500 text-xs">
            {{ editValidationErrors.descricao }}
          </p>
          <p class="text-gray-500 text-xs ml-auto">
            {{ projetoLocal.descricao?.length || 0 }}/1000
          </p>
        </div>
      </div>

      <!-- Datas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-primary mb-1"
            >Data de Início *</label
          >
          <input
            v-model="projetoLocal.dataInicio"
            @change="validarCampoEdicao('dataInicio', projetoLocal.dataInicio)"
            type="date"
            class="w-full border rounded px-4 py-2 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            :class="
              editValidationErrors.dataInicio
                ? 'border-red-500'
                : 'border-amber-700'
            "
            required
          />
          <p
            v-if="editValidationErrors.dataInicio"
            class="text-red-500 text-xs mt-1"
          >
            {{ editValidationErrors.dataInicio }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-primary mb-1"
            >Data Fim Prevista *</label
          >
          <input
            v-model="projetoLocal.dataFimPrevista"
            @change="
              validarCampoEdicao(
                'dataFimPrevista',
                projetoLocal.dataFimPrevista
              )
            "
            type="date"
            class="w-full border rounded px-4 py-2 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            :class="
              editValidationErrors.dataFimPrevista
                ? 'border-red-500'
                : 'border-amber-700'
            "
            required
          />
          <p
            v-if="editValidationErrors.dataFimPrevista"
            class="text-red-500 text-xs mt-1"
          >
            {{ editValidationErrors.dataFimPrevista }}
          </p>
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
          :key="subprojeto.key"
          class="border border-amber-300 rounded p-3 mb-3 bg-amber-50"
        >
          <!-- Seleção do Subprojeto -->
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
            class="ml-4 space-y-3"
          >
            <div class="mb-2 border-b border-amber-200 pb-1">
              <span class="text-xs font-medium text-primary"
                >Tarefas Vinculadas</span
              >
            </div>

            <div
              v-for="(tarefa, tarefaIndex) in subprojeto.tarefas"
              :key="tarefaIndex"
              class="border border-blue-200 rounded p-2 bg-blue-50"
            >
              <div class="mb-2">
                <label class="block text-xs font-medium text-primary"
                  >Tarefa</label
                >
                <input
                  :value="tarefa.tarefaNome"
                  type="text"
                  class="w-full border border-blue-300 rounded px-2 py-1 text-xs bg-gray-100 cursor-not-allowed"
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
                <label class="block text-xs text-primary mb-1"
                  >Observações</label
                >
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
    @close="showNotification = false"
  />
</template>
