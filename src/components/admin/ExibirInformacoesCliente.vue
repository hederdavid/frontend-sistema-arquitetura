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
} from "@/utils/utilitarios.js";

const mostrarTodosTelefones = ref(false);

const props = defineProps({
  cliente: {
    type: Object,
    required: true,
  },
});

// Copia local do cliente para edição
const clienteLocal = ref({
  ...props.cliente,
  telefones: Array.isArray(props.cliente.telefones)
    ? [...props.cliente.telefones]
    : props.cliente.telefone
    ? [props.cliente.telefone]
    : [],
});

watch(
  () => props.cliente,
  (novo) => {
    clienteLocal.value = {
      ...novo,
      telefones: Array.isArray(novo.telefones)
        ? [...novo.telefones]
        : novo.telefone
        ? [novo.telefone]
        : [],
    };
  },
  { deep: true }
);

const preencherEndereco = async () => {
  try {
    const endereco = await buscarEndereco(clienteLocal.value.cep);
    if (endereco) {
      clienteLocal.value.logradouro = endereco.logradouro || "";
      clienteLocal.value.bairro = endereco.bairro || "";
      clienteLocal.value.cidade = endereco.localidade || "";
      clienteLocal.value.uf = endereco.uf || "";
      clienteLocal.value.complemento = endereco.complemento || "";
    } else {
      mostrarAlertaErro(
        "Erro",
        "Endereço não encontrado para o CEP informado."
      );
    }
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);
    mostrarAlertaErro("Erro", "Erro ao buscar endereço.");
  }
};

const emit = defineEmits(["clienteAtualizado", "clienteExcluido"]);

const isModalOpen = ref(false);

// Função para atualizar cliente
const atualizarCliente = async () => {
  const c = clienteLocal.value;

  // Campos obrigatórios
  if (
    !c.nome_completo ||
    !c.cpfOuCnpj ||
    !c.email ||
    !c.telefones.length ||
    !c.logradouro ||
    !c.numero ||
    !c.bairro ||
    !c.cidade ||
    !c.uf ||
    !c.cep
  ) {
    mostrarAlertaErro("Erro", "Preencha todos os campos obrigatórios.");
    return;
  }

  // Email
  if (!validarEmail(c.email)) {
    mostrarAlertaErro("Erro", "Insira um email válido.");
    return;
  }

  const doc = c.cpfOuCnpj.replace(/\D/g, "");

  // CPF ou CNPJ
  if (validarCPF(doc)) {
    c.tipo = "PESSOA_FISICA";
  } else if (validarCNPJ(doc)) {
    c.tipo = "PESSOA_JURIDICA";
  } else {
    mostrarAlertaErro("Erro", "CPF ou CNPJ inválido.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/clientes/${c._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...c,
        telefones: c.telefones,
      }),
    });

    if (!response.ok) throw new Error("Erro ao atualizar cliente");

    const data = await response.json();
    emit("clienteAtualizado", c);
    console.log("Cliente atualizado:", data);

    isModalOpen.value = false;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
  }
};

const excluirCliente = async (id) => {
  const result = await mostrarAlertaAtencao(
    "Atenção",
    "Este cliente está associado a outros dados no sistema. A exclusão irá remover também as associações relacionadas. Verifique as informações antes de prosseguir."
  );

  if (!result.isConfirmed) return;

  if (!id) {
    mostrarAlertaErro("Erro", "ID do cliente não encontrado.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/clientes/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao excluir cliente");

    console.log("Cliente excluído:", id);
    emit("clienteExcluido", id);
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
  }
};

// Funções para manipular telefones
const adicionarTelefone = () => {
  clienteLocal.value.telefones.push("");
};
const removerTelefone = (index) => {
  clienteLocal.value.telefones.splice(index, 1);
};
</script>

<template>
  <ul
    class="flex justify-between mt-2 text-gray-800 border-t pt-2 items-center"
  >
    <li class="basis-2/5 text-primary font-semibold">
      {{ props.cliente.nome_completo }}
    </li>
    <li class="basis-1/5 text-primary font-semibold">
      {{ props.cliente.cpfOuCnpj }}
    </li>
    <li class="basis-1/5 text-primary font-semibold relative">
      <span v-if="Array.isArray(props.cliente.telefones)">
        {{ props.cliente.telefones[0] || '' }}
        <button
          v-if="props.cliente.telefones.length > 1"
          @click="mostrarTodosTelefones = !mostrarTodosTelefones"
          class="ml-2 text-xs text-blue-600 underline focus:outline-none"
          title="Ver todos os telefones"
        >
          +{{ props.cliente.telefones.length - 1 }}
        </button>
        <div
          v-if="mostrarTodosTelefones"
          class="absolute z-10 bg-white border border-gray-300 rounded shadow-md p-2 mt-1 left-0 min-w-[120px]"
        >
          <div
            v-for="(tel, i) in props.cliente.telefones"
            :key="i"
            class="text-gray-800 text-sm"
          >
            {{ tel }}
          </div>
          <button
            @click="mostrarTodosTelefones = false"
            class="block mt-2 text-xs text-blue-600 underline focus:outline-none"
          >
            Fechar
          </button>
        </div>
      </span>
      <span v-else>
        {{ props.cliente.telefone || "" }}
      </span>
    </li>
    <li class="basis-1/5">
      <div class="flex gap-2">
        <button
          @click="isModalOpen = true"
          class="text-white bg-[#D97706] font-medium px-4 py-1 rounded transition-all duration-300 hover:bg-orange-100 hover:text-orange-700 hover:scale-105"
        >
          Editar
        </button>
        <button
          @click="excluirCliente(clienteLocal._id)"
          class="text-white bg-[#B91C1C] font-medium px-4 py-1 rounded transition-all duration-300 hover:bg-red-100 hover:text-red-700 hover:scale-105"
        >
          Excluir
        </button>
      </div>
    </li>
  </ul>
  <BaseModal
    :visible="isModalOpen"
    title="Atualizar Cliente"
    confirm-text="Salvar"
    @close="isModalOpen = false"
    @confirm="atualizarCliente"
  >
    <!-- Formulário do Cliente -->
    <form class="grid grid-cols-2 gap-4">
      <div class="col-span-2 flex w-full gap-4">
        <input
          v-model="clienteLocal.nome_completo"
          type="text"
          class="flex-[1.5] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Nome Completo"
        />
        <input
          v-model="clienteLocal.cpfOuCnpj"
          type="text"
          class="flex-[1] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="CPF/CNPJ"
        />
      </div>

      <div class="col-span-2 flex w-full gap-4">
        <input
          v-model="clienteLocal.email"
          type="email"
          class="flex-[2] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Email"
        />
      </div>

      <!-- Telefones -->
      <div class="col-span-2">
        <label class="font-semibold text-primary">Telefones</label>
        <div v-for="(tel, i) in clienteLocal.telefones" :key="i" class="flex gap-2 mt-1">
          <input
            v-model="clienteLocal.telefones[i]"
            type="text"
            class="flex-1 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            :placeholder="`Telefone ${i + 1}`"
          />
          <button
            type="button"
            @click="removerTelefone(i)"
            class="text-white bg-red-600 px-2 rounded hover:bg-red-800"
            v-if="clienteLocal.telefones.length > 1"
          >
            Remover
          </button>
        </div>
        <button
          type="button"
          @click="adicionarTelefone"
          class="mt-2 text-white bg-green-600 px-3 py-1 rounded hover:bg-green-800"
        >
          Adicionar Telefone
        </button>
      </div>

      <h3 class="col-span-2 font-semibold mt-2 text-primary">Endereço</h3>

      <input
        v-model="clienteLocal.cep"
        type="text"
        @blur="preencherEndereco"
        class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="CEP"
      />
      <input
        v-model="clienteLocal.cidade"
        type="text"
        class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="Cidade"
      />
      <input
        v-model="clienteLocal.uf"
        type="text"
        class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="UF"
      />
      <input
        v-model="clienteLocal.bairro"
        type="text"
        class="col-span-2 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="Bairro"
      />
      <input
        v-model="clienteLocal.logradouro"
        type="text"
        class="col-span-2 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="Rua"
      />
      <input
        v-model="clienteLocal.numero"
        type="text"
        class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="Número"
      />
      <input
        v-model="clienteLocal.complemento"
        type="text"
        class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="Complemento"
      />
    </form>
  </BaseModal>
</template>