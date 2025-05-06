<script setup>
import { ref, onMounted } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import ExibirInformacoesCliente from "@/components/admin/ExibirInformacoesCliente.vue";
import { API_URL } from "../../utils/apiUrl.js";
import { buscarEndereco } from "@/utils/buscarEnderecoApi.js";
import { validarEmail, validarCPF, validarCNPJ } from "@/utils/validacoes.js";
/* const clientesTeste = ref([
  {
    nome_completo: "Ana Paula Souza",
    cpfOuCnpj: "123.456.789-00",
    email: "ana.souza@example.com",
    telefone: "(11) 98765-4321",
    logradouro: "Rua das Flores",
    numero: "123",
    bairro: "Jardim Primavera",
    complemento: "Apto 45",
    cidade: "São Paulo",
    uf: "SP",
    cep: "01234-567",
    tipo: "Pessoa Física"
  },
  {
    nome_completo: "Carlos Henrique Lima",
    cpfOuCnpj: "987.654.321-00",
    email: "carlos.lima@example.com",
    telefone: "(21) 99876-5432",
    logradouro: "Avenida Central",
    numero: "456",
    bairro: "Centro",
    complemento: "",
    cidade: "Rio de Janeiro",
    uf: "RJ",
    cep: "20000-000",
    tipo: "Pessoa Física"
  },
  {
    nome_completo: "Empresa ABC Ltda",
    cpfOuCnpj: "12.345.678/0001-90",
    email: "contato@empresaabc.com.br",
    telefone: "(31) 3344-5566",
    logradouro: "Rua Industrial",
    numero: "789",
    bairro: "Distrito Industrial",
    complemento: "Galpão 3",
    cidade: "Belo Horizonte",
    uf: "MG",
    cep: "30123-456",
    tipo: "Pessoa Jurídica"
  },
  {
    nome_completo: "Mariana Oliveira",
    cpfOuCnpj: "321.654.987-00",
    email: "mariana.oliveira@example.com",
    telefone: "(41) 91234-5678",
    logradouro: "Rua das Acácias",
    numero: "321",
    bairro: "Santa Felicidade",
    complemento: "Casa",
    cidade: "Curitiba",
    uf: "PR",
    cep: "80540-120",
    tipo: "Pessoa Física"
  },
  {
    nome_completo: "Construtora XYZ",
    cpfOuCnpj: "98.765.432/0001-10",
    email: "suporte@construtoraxyz.com",
    telefone: "(51) 4002-8922",
    logradouro: "Avenida das Construções",
    numero: "1000",
    bairro: "Zona Sul",
    complemento: "",
    cidade: "Porto Alegre",
    uf: "RS",
    cep: "90000-000",
    tipo: "Pessoa Jurídica"
  }
]); */

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
      alert("Endereço não encontrado para o CEP informado.");
    }
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);
    alert("Erro ao buscar endereço.");
  }
};

const handleClienteAtualizado = (clienteAtualizado) => {
  // Atualize a lista de clientes ou substitua o cliente na lista
  const index = clientes.value.findIndex((c) => c.id === clienteAtualizado.id);
  if (index !== -1) {
    clientes.value[index] = clienteAtualizado;
  }
};

const isModalOpen = ref(false);

const clientes = ref([]);

// Dados do cliente
const cliente = ref({
  nome_completo: "",
  cpfOuCnpj: "",
  email: "",
  telefone: "",
  logradouro: "",
  numero: "",
  bairro: "",
  complemento: "",
  cidade: "",
  uf: "",
  cep: "",
  tipo: "",
});

// Função para buscar todos os clientes
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

// Função para salvar cliente
const salvarCliente = async () => {
  const c = cliente.value;

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
    cliente.value = {
      nome_completo: "",
      cpfOuCnpj: "",
      email: "",
      telefone: "",
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
    console.error("Erro ao salvar cliente:", error);
  }
};

// Carregar clientes ao montar o componente
onMounted(() => {
  carregarClientes();
});
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
        v-for="cliente in clientesTeste"
        :key="cliente._id"
        :cliente="cliente"
        @clienteAtualizado="handleClienteAtualizado"
      />
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
          <input
            v-model="cliente.telefone"
            type="text"
            class="flex-[1] min-w-0 border border-amber-700 rounded px-4 py-2 w-full placeholder:text-amber-700 placeholder:opacity-70 text-sm bg-primary bg-opacity-5 focus:outline-amber-800 focus:ring-0"
            placeholder="Telefone *"
          />
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
  </div>
</template>
