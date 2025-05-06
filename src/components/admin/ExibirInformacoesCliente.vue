<script setup>
import { ref } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { API_URL } from "../../utils/apiUrl.js";
import { buscarEndereco } from "@/utils/buscarEnderecoApi.js";
import { validarEmail, validarCPF, validarCNPJ } from "@/utils/validacoes.js";
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  cliente: {
    type: Object,
    required: true,
  },
});

const preencherEndereco = async () => {
  try {
    const endereco = await buscarEndereco(props.cliente.cep);
    if (endereco) {
      props.cliente.logradouro = endereco.logradouro || "";
      props.cliente.bairro = endereco.bairro || "";
      props.cliente.cidade = endereco.localidade || "";
      props.cliente.uf = endereco.uf || "";
      props.cliente.complemento = endereco.complemento || "";
    } else {
      alert("Endereço não encontrado para o CEP informado.");
    }
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);
    alert("Erro ao buscar endereço.");
  }
};


const emit = defineEmits(['clienteAtualizado']);

const isModalOpen = ref(false);


// Função para atualizar cliente
const atualizarCliente = async () => {
  const c = props.cliente; // Acessando diretamente a prop 'cliente'

  // Campos obrigatórios
  if (
    !c.nome_completo ||
    !c.cpfOuCnpj ||
    !c.email ||
    !c.telefone ||
    !c.logradouro ||
    !c.numero ||
    !c.bairro ||
    !c.cidade ||
    !c.uf ||
    !c.cep
  ) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  // Email
  if (!validarEmail(c.email)) {
    alert("E-mail inválido.");
    return;
  }

  const doc = c.cpfOuCnpj.replace(/\D/g, "");

  // CPF ou CNPJ
  if (validarCPF(doc)) {
    c.tipo = "PESSOA_FISICA";
  } else if (validarCNPJ(doc)) {
    c.tipo = "PESSOA_JURIDICA";
  } else {
    alert("CPF ou CNPJ inválido.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/clientes/${props.cliente._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(c),
    });

    if (!response.ok) throw new Error("Erro ao atualizar cliente");

    const data = await response.json();
    emit('clienteAtualizado', c);
    console.log("Cliente atualizado:", data);

    isModalOpen.value = false;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
  }
};
</script>

<template>
  <ul
    class="flex justify-between mt-2 text-gray-800 border-t pt-2 items-center"
  >
    <li class="basis-2/5 text-primary font-semibold">{{ props.cliente.nome_completo }}</li>
    <li class="basis-1/5 text-primary font-semibold">{{ props.cliente.cpfOuCnpj }}</li>
    <li class="basis-1/5 text-primary font-semibold">{{ props.cliente.telefone }}</li>
    <li class="basis-1/5">
      <div class="flex gap-2">
        <button
          @click="isModalOpen = true"
          class="text-white bg-[#D97706] font-medium px-4 py-1 rounded transition-all duration-300 hover:bg-orange-100 hover:text-orange-700 hover:scale-105"
        >
          Editar
        </button>
        <button
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
          v-model="props.cliente.nome_completo"
          type="text"
          class="flex-[1.5] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Nome Completo"
        />
        <input
          v-model="props.cliente.cpfOuCnpj"
          type="text"
          class="flex-[1] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="CPF/CNPJ"
        />
      </div>

      <div class="col-span-2 flex w-full gap-4">
        <input
          v-model="props.cliente.email"
          type="email"
          class="flex-[2] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Email"
        />
        <input
          v-model="props.cliente.telefone"
          type="text"
          class="flex-[1] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Telefone"
        />
      </div>

      <h3 class="col-span-2 font-semibold mt-2 text-primary">Endereço</h3>

      <input
        v-model="props.cliente.cep"
        type="text"
        @blur="preencherEndereco"
        class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="CEP"
      />
      <input
        v-model="props.cliente.cidade"
        type="text"
        class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="Cidade"
      />
      <input
        v-model="props.cliente.uf"
        type="text"
        class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="UF"
      />
      <input
        v-model="props.cliente.bairro"
        type="text"
        class="col-span-2 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="Bairro"
      />
      <input
        v-model="props.cliente.logradouro"
        type="text"
        class="col-span-2 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="Rua"
      />
      <input
        v-model="props.cliente.numero"
        type="text"
        class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="Número"
      />
      <input
        v-model="props.cliente.complemento"
        type="text"
        class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
        placeholder="Complemento"
      />
    </form>
  </BaseModal>
</template>
