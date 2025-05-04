<template>
  <div class="flex flex-col h-screen font-sans bg-pale-rose bg-opacity-30">
    <!-- Botão Novo Cliente -->
    <button
      @click="isModalOpen = true"
      class="font-semibold tracking-widest flex gap-4 bg-primary self-end text-white px-6 py-3 rounded-full shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      <img src="../../components/icons/add-icone-3.svg" alt="Adicionar" />
      NOVO CLIENTE
    </button>

    <!-- Conteúdo Principal -->
    <div class="bg-white w-4/5 h-[85%] mx-auto mt-10 rounded-lg shadow-md p-5">
      <!-- Seu conteúdo aqui -->
    </div>

    <!-- Modal de Cadastro de Cliente -->
    <BaseModal
      :visible="isModalOpen"
      title="Cadastrar Cliente"
      confirm-text="Salvar"
      @close="isModalOpen = false"
      @confirm="salvarCliente"
    >
      <!-- Formulário do Cliente -->
      <form class="grid grid-cols-2 gap-4">
        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:border-amber-800 focus:ring-0"
          placeholder="Nome Completo"
        />

        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-10"
          placeholder="CPF/CNPJ"
        />
        <input
          class="col-span-2 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-10"
          placeholder="Email"
        />
        <input
          class="col-span-2 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-10"
          placeholder="Telefone"
        />

        <h3 class="col-span-2 font-semibold mt-2 text-primary">Endereço</h3>

        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5"
          placeholder="CEP"
        />
        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-10"
          placeholder="Cidade"
        />
        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-10"
          placeholder="UF"
        />
        <input
          class="col-span-2 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-10"
          placeholder="Bairro"
        />
        <input
          class="col-span-2 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-10"
          placeholder="Rua"
        />
        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-10"
          placeholder="Número"
        />
        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5"
          placeholder="Complemento"
        />
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from "vue";
import BaseModal from "@/components/BaseModal.vue"; // ajuste o caminho conforme necessário

const isModalOpen = ref(false);

const salvarCliente = () => {
  console.log("Cliente salvo!");
  isModalOpen.value = false;
};
</script>
