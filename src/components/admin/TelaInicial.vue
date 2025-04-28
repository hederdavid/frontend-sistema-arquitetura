<script setup>
import DescricaoTarefas from "../DescricaoTarefas.vue";
import GoogleCalendar from "../GoogleCalendar.vue";
import CardProjetos from "./CardProjetos.vue";

const STATUS = {
  NAO_INICIADO: "NAO_INICIADO",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  CONCLUIDO: "CONCLUIDO",
};

const tarefas = [
  {
    nome: "Desenhar planta baixa",
    projeto: "Casa de Praia",
    status: STATUS.NAO_INICIADO,
  },
  {
    nome: "Modelagem 3D da fachada",
    projeto: "Edifício Comercial",
    status: STATUS.EM_ANDAMENTO,
  },
  {
    nome: "Criar maquete eletrônica",
    projeto: "Residência Alto Padrão",
    status: STATUS.NAO_INICIADO,
  },
  {
    nome: "Revisar projeto estrutural",
    projeto: "Reforma de Apartamento",
    status: STATUS.CONCLUIDO,
  },
  {
    nome: "Apresentação para cliente",
    projeto: "Condomínio de Casas",
    status: STATUS.EM_ANDAMENTO,
  },
];

const tarefasNaoIniciadas = tarefas.filter(
  (tarefa) => tarefa.status === STATUS.NAO_INICIADO
);
const tarefasEmAndamento = tarefas.filter(
  (tarefa) => tarefa.status === STATUS.EM_ANDAMENTO
);
const tarefasConcluidas = tarefas.filter(
  (tarefa) => tarefa.status === STATUS.CONCLUIDO
);
</script>
<template>
  <div class="grid grid-cols-[1fr_25%] gap-4">
    <!-- Coluna da esquerda: Projetos -->
    <main>
      <h1 class="text-primary text-3xl mb-5 font-bold">
        Olá, <span class="text-secondary">Anne Beatriz</span> ✌
        <br />
        <span class="font-normal text-lg">Seja bem-vindo(a) ao sistema.</span>
      </h1>

      <div class="flex flex-col">
        <h2 class="text-secondary text-2xl pb-4">Meus Projetos</h2>
        <div class="flex flex-wrap gap-4">
          <CardProjetos v-for="n in 8" :key="n" :index="n" />
        </div>
        <div class="flex justify-center mt-6">
          <button
            class="bg-secondary text-white font-semibold py-2.5 px-8 rounded-full shadow-md hover:shadow-lg hover:bg-secondary-dark transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 ease-in-out hover:text-secondary hover:bg-white hover:border-2 hover:border-secondary border-2"
          >
            Ver mais projetos
          </button>
        </div>
      </div>
    </main>

    <!-- Coluna da direita: Calendário -->
    <aside class="w-full bg-white rounded-xl shadow-md p-4">
      <h2 class="text-secondary text-2xl pb-4 flex gap-2 font-semibold">
        <img src="../icons/icone-calendário.svg" alt="Calendário" />Calendário
      </h2>
      <GoogleCalendar />
      <div class="flex justify-around items-center my-4">
        <h3 class="text-secondary font-bold">Tarefas</h3>
        <button
          class="flex gap-1 text-tertiary border-2 border-tertiary rounded-3xl py-1 px-2 font-semibold transition-all transform duration-300 hover:scale-105"
        >
          <img src="../icons/add-icone-2.svg" alt="Ícone criar tarefa" />
          Criar tarefa
        </button>
      </div>
      <div class="flex flex-col gap-4">
        <DescricaoTarefas
          :tarefas="tarefasNaoIniciadas"
          status="NÃO INICIADO"
        />
        <DescricaoTarefas :tarefas="tarefasEmAndamento" status="EM ANDAMENTO" />
        <DescricaoTarefas :tarefas="tarefasConcluidas" status="CONCLUÍDO" />
      </div>
    </aside>
  </div>
</template>

<style></style>
