<template>
  <div
    class="flex flex-col h-screen font-sans bg-pale-rose bg-opacity-30 items-center"
  >
    <!-- Botão Novo Cliente -->
    <button
      @click="isModalOpen = true"
      class="font-semibold tracking-widest flex gap-4 bg-primary self-end text-white px-6 py-3 rounded-full shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      <img src="../../components/icons/add-icone-3.svg" alt="Adicionar" />
      NOVO CLIENTE
    </button>

    <!-- Conteúdo Principal -->
    <div class="bg-white w-[90%] mt-10 rounded-lg shadow-md p-5">
      <div class="flex justify-between">
        <p class="text-2xl text-primary font-semibold">
          4 resultados encontrados
        </p>
        <div class="relative w-full max-w-sm">
          <img
            src="../../components/icons/lupa.svg"
            alt="Lupa"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Pesquisar cliente"
            class="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-es-xl focus:outline-primary focus:ring-0 focus:ring-primary-500"
          />
        </div>
      </div>
      <div>
        <ul class="flex justify-between mt-10 text-primary opacity-50">
          <li class="basis-2/5">Nome</li>
          <li class="basis-1/5">CPF/CNPJ</li>
          <li class="basis-1/5">Telefone</li>
          <li class="basis-1/5">Ações</li>
        </ul>
      </div>

      <ExibirInformacoesCliente />
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
        <div class="col-span-2 flex w-full gap-4">
          <input
            class="flex-[1.5] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Nome Completo"
          />
          <input
            class="flex-[1] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="CPF/CNPJ"
          />
        </div>

        <div class="col-span-2 flex w-full gap-4">
          <input
            class="flex-[2] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Email"
          />
          <input
            class="flex-[1] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Telefone"
          />
        </div>

        <h3 class="col-span-2 font-semibold mt-2 text-primary">Endereço</h3>

        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="CEP"
        />
        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Cidade"
        />
        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="UF"
        />
        <input
          class="col-span-2 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Bairro"
        />
        <input
          class="col-span-2 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Rua"
        />
        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Número"
        />
        <input
          class="border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
          placeholder="Complemento"
        />
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from "vue";
import BaseModal from "@/components/BaseModal.vue"; // ajuste o caminho conforme necessário
import ExibirInformacoesCliente from "@/components/admin/ExibirInformacoesCliente.vue";

const isModalOpen = ref(false);

const salvarCliente = () => {
  console.log("Cliente salvo!");
  isModalOpen.value = false;
};
</script>
