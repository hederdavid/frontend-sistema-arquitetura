<script setup>
import { ref, onMounted } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import ExibirInformacoesCliente from "@/components/admin/ExibirInformacoesCliente.vue";
import { API_URL } from "../../utils/apiUrl.js";
import { buscarEndereco } from "@/utils/buscarEnderecoApi.js";
import { validarEmail, validarCPF, validarCNPJ } from "@/utils/validacoes.js";
import { mostrarAlertaErro } from "@/utils/utilitarios.js";
import { clientesTeste } from "@/utils/clientesTeste.js";
import MensagemNotificacao from "@/components/MensagemNotificacao.vue";

const showNotification = ref(false);
const notificationType = ref("success");
const notificationMessage = ref("");

const showSuccess = () => {
  notificationType.value = "success";
  notificationMessage.value = "Usuário criado com sucesso!";
  showNotification.value = true;
};

const showError = () => {
  notificationType.value = "error";
  notificationMessage.value = "Erro ao criar o usuário!";
  showNotification.value = true;
  isModalOpen.value = false;
};

const isModalOpen = ref(false);

const clientes = ref([]);

const cliente = ref({
  nome_completo: "",
  cpfOuCnpj: "",
  email: "",
  telefones: [""],
  logradouro: "",
  numero: "",
  bairro: "",
  complemento: "",
  cidade: "",
  uf: "",
  cep: "",
  tipo: "",
});

const preencherEndereco = async () => {
  try {
    const endereco = await buscarEndereco(cliente.value.cep);
    if (endereco) {
      cliente.value.logradouro = endereco.logradouro || "";
      cliente.value.bairro = endereco.bairro || "";
      cliente.value.cidade = endereco.localidade || "";
      cliente.value.uf = endereco.uf || "";
      cliente.value.complemento = endereco.complemento || "";
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

const carregarClientes = async () => {
  try {
    const response = await fetch(`${API_URL}/clientes`);
    if (!response.ok) throw new Error("Erro ao carregar clientes");

    const data = await response.json();
    clientes.value = data;
    console.log("Clientes carregados:", data);
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
  }
};

const pesquisarClientes = async (query) => {
  if (!query.trim()) {
    await carregarClientes(); // Recarrega todos os clientes se a busca estiver vazia
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/clientes/buscar?nome=${encodeURIComponent(query.trim())}`
    );

    if (!response.ok) {
      throw new Error(`Erro ao pesquisar clientes: ${response.statusText}`);
    }

    const data = await response.json();

    // 👇 Corrigido aqui
    clientes.value = data.clientes;

    console.log("Clientes encontrados:", data.clientes);
  } catch (error) {
    console.error("Erro ao pesquisar clientes:", error.message);
    mostrarAlertaErro(
      "Erro",
      "Não foi possível realizar a pesquisa. Tente novamente."
    );
  }
};

const salvarCliente = async () => {
  const c = cliente.value;

  // Validação de campos obrigatórios
  if (
    !c.nome_completo ||
    !c.cpfOuCnpj ||
    !c.email ||
    c.telefones.length === 0 ||
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

  if (c.telefones.length < 1) {
    mostrarAlertaErro("Erro", "Adicione pelo menos um telefone.");
    return;
  }

  // Validação de telefones duplicados
  const telefonesUnicos = new Set(c.telefones);
  if (telefonesUnicos.size !== c.telefones.length) {
    mostrarAlertaErro(
      "Erro",
      "Não é permitido adicionar telefones duplicados."
    );
    return;
  }

  if (!validarEmail(c.email)) {
    mostrarAlertaErro("Erro", "Insira um e-mail válido.");
    return;
  }

  const doc = c.cpfOuCnpj.replace(/\D/g, "");

  if (validarCPF(doc)) {
    c.tipo = "PESSOA_FISICA";
  } else if (validarCNPJ(doc)) {
    c.tipo = "PESSOA_JURIDICA";
  } else {
    mostrarAlertaErro("Erro", "CPF ou CNPJ inválido.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/clientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(c),
    });

    if (!response.ok) throw new Error("Erro ao salvar cliente");

    const data = await response.json();
    console.log("Cliente salvo:", data);

    isModalOpen.value = false;
    showSuccess();
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);

    // Resetar o formulário
    cliente.value = {
      nome_completo: "",
      cpfOuCnpj: "",
      email: "",
      telefones: [""],
      logradouro: "",
      numero: "",
      bairro: "",
      complemento: "",
      cidade: "",
      uf: "",
      cep: "",
      tipo: "",
    };

    carregarClientes();
  } catch (error) {
    showError();
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);
    console.error("Erro ao salvar cliente:", error);
  }
};

const handleClienteAtualizado = (clienteAtualizado) => {
  const index = clientes.value.findIndex(
    (c) => c._id === clienteAtualizado._id
  );
  if (index !== -1) {
    clientes.value[index] = clienteAtualizado;
    clientes.value = [...clientes.value];
  }
};

const handleClienteExcluido = (id) => {
  const index = clientes.value.findIndex((c) => c._id === id);
  if (index !== -1) {
    clientes.value.splice(index, 1);
    clientes.value = [...clientes.value];
  }
};

onMounted(() => {
  carregarClientes();
});

// Funções para manipular telefones
const adicionarTelefone = () => {
  cliente.value.telefones.push("");
};
const removerTelefone = (index) => {
  cliente.value.telefones.splice(index, 1);
};
</script>

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
          {{ clientes.length }} resultados encontrados
        </p>
        <div class="relative w-full max-w-sm">
          <img
            src="../../components/icons/lupa.svg"
            alt="Lupa"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
          />
          <input
            @input="pesquisarClientes($event.target.value)"
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

      <ExibirInformacoesCliente
        v-if="clientes.length > 0"
        v-for="cliente in clientes"
        :key="cliente._id"
        :cliente="cliente"
        @clienteAtualizado="handleClienteAtualizado"
        @clienteExcluido="handleClienteExcluido"
      />
      <div>
        <p
          v-if="clientes.length === 0"
          class="text-center text-primary font-semibold mt-10"
        >
          Nenhum cliente encontrado.
        </p>
      </div>
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
            v-model="cliente.nome_completo"
            type="text"
            class="flex-[1.5] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Nome Completo *"
            required
          />
          <input
            v-model="cliente.cpfOuCnpj"
            type="text"
            class="flex-[1] min-w-0 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="CPF/CNPJ *"
          />
        </div>

        <div class="col-span-2 flex w-full gap-4">
          <input
            v-model="cliente.email"
            type="email"
            class="flex-[2] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Email *"
          />
        </div>

        <div class="col-span-2">
          <label class="font-semibold text-primary">Telefones</label>
          <div
            v-for="(tel, i) in cliente.telefones"
            :key="i"
            class="flex gap-2 mt-1"
          >
            <input
              v-model="cliente.telefones[i]"
              type="text"
              class="flex-1 border border-amber-700 rounded px-4 py-2 placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
              :placeholder="`Telefone ${i + 1}`"
              required
            />
            <button
              type="button"
              @click="removerTelefone(i)"
              class="text-white bg-red-600 px-2 rounded hover:bg-red-800"
              v-if="cliente.telefones.length > 1"
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

        <div class="col-span-2 flex gap-4">
          <input
            v-model="cliente.cep"
            type="text"
            @blur="preencherEndereco"
            class="flex-[1] border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="CEP *"
          />
          <input
            v-model="cliente.cidade"
            type="text"
            class="flex-[3] border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Cidade *"
          />
          <input
            v-model="cliente.uf"
            type="text"
            class="flex-[0.3] border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="UF *"
          />
        </div>

        <div class="col-span-2 flex gap-4">
          <input
            v-model="cliente.bairro"
            type="text"
            class="flex-[1] border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Bairro *"
          />
          <input
            v-model="cliente.logradouro"
            type="text"
            class="flex-[2] border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Rua *"
          />
        </div>

        <div class="col-span-2 flex gap-4">
          <input
            v-model="cliente.numero"
            type="text"
            class="flex-[1] border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Número *"
          />
          <input
            v-model="cliente.complemento"
            type="text"
            class="flex-[4] border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Complemento"
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
