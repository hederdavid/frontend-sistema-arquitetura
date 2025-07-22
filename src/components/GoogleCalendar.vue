<script setup></script>
<template>
  <div class="w-full">
    <!-- Header Compacto -->
    <div class="flex items-center justify-between mb-3">
      <button 
        @click="mesAnterior" 
        class="p-1 hover:bg-gray-200 rounded-md transition-colors duration-200"
      >
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <h3 class="text-sm font-semibold text-gray-800">
        {{ mesAtual.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase()) }}
      </h3>
      
      <button 
        @click="proximoMes" 
        class="p-1 hover:bg-gray-200 rounded-md transition-colors duration-200"
      >
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>

    <!-- Dias da Semana Compactos -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div 
        v-for="dia in diasSemana" 
        :key="dia"
        class="text-center text-xs font-medium text-gray-500 py-1"
      >
        {{ dia }}
      </div>
    </div>

    <!-- Calendário Compacto -->
    <div class="grid grid-cols-7 gap-1">
      <button
        v-for="dia in diasCalendario"
        :key="dia.data"
        @click="selecionarDia(dia)"
        :class="[
          'aspect-square flex items-center justify-center text-xs rounded transition-all duration-200 hover:bg-gray-100 relative',
          {
            'text-gray-400': !dia.mesAtual,
            'text-gray-900': dia.mesAtual && !dia.hoje && !dia.selecionado,
            'bg-secondary text-white font-semibold hover:bg-secondary-dark': dia.hoje,
            'bg-blue-100 text-blue-800 font-medium': dia.selecionado && !dia.hoje,
          }
        ]"
      >
        {{ dia.numero }}
        <span v-if="dia.eventos > 0" class="absolute bottom-0 right-0 w-1 h-1 bg-red-500 rounded-full"></span>
      </button>
    </div>

    <!-- Evento do Dia (Compacto) -->
    <div v-if="diaSelecionado && eventosDodia.length > 0" class="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
      <div class="text-xs font-medium text-blue-800 mb-1">
        📅 {{ diaSelecionado.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) }}
      </div>
      <div class="text-xs text-blue-700">
        {{ eventosDodia[0].titulo }}
        <span class="text-blue-500 ml-1">{{ eventosDodia[0].horario }}</span>
      </div>
      <div v-if="eventosDodia.length > 1" class="text-xs text-blue-500 mt-1">
        +{{ eventosDodia.length - 1 }} evento(s)
      </div>
    </div>

    <!-- Botão Hoje (Compacto) -->
    <div class="mt-3 flex justify-center">
      <button 
        @click="irParaHoje"
        class="px-3 py-1 text-xs font-medium text-secondary border border-secondary rounded-md hover:bg-secondary hover:text-white transition-colors duration-200"
      >
        Hoje
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Estados reativos
const mesAtual = ref(new Date());
const diaSelecionado = ref(new Date());

// Dados compactos
const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Eventos fictícios
const eventos = ref([
  {
    id: 1,
    titulo: 'Reunião cliente',
    data: new Date(2024, 11, 15),
    horario: '14:00'
  },
  {
    id: 2,
    titulo: 'Revisão projeto',
    data: new Date(2024, 11, 20),
    horario: '10:30'
  }
]);

// Computed para gerar os dias do calendário
const diasCalendario = computed(() => {
  const ano = mesAtual.value.getFullYear();
  const mes = mesAtual.value.getMonth();
  
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const primeiroDiaSemana = primeiroDia.getDay();
  
  const dias = [];
  
  // Dias do mês anterior
  for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
    const dia = new Date(ano, mes, -i);
    dias.push({
      numero: dia.getDate(),
      data: dia.toISOString(),
      mesAtual: false,
      hoje: false,
      selecionado: false,
      eventos: 0
    });
  }
  
  // Dias do mês atual
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    const dataAtual = new Date(ano, mes, dia);
    const hoje = new Date();
    const ehHoje = dataAtual.toDateString() === hoje.toDateString();
    const ehSelecionado = dataAtual.toDateString() === diaSelecionado.value.toDateString();
    
    dias.push({
      numero: dia,
      data: dataAtual.toISOString(),
      mesAtual: true,
      hoje: ehHoje,
      selecionado: ehSelecionado,
      eventos: eventos.value.filter(e => e.data.toDateString() === dataAtual.toDateString()).length
    });
  }
  
  // Dias do próximo mês (limitados)
  const diasRestantes = Math.min(42 - dias.length, 14);
  for (let dia = 1; dia <= diasRestantes; dia++) {
    const dataProxima = new Date(ano, mes + 1, dia);
    dias.push({
      numero: dia,
      data: dataProxima.toISOString(),
      mesAtual: false,
      hoje: false,
      selecionado: false,
      eventos: 0
    });
  }
  
  return dias;
});

// Eventos do dia selecionado
const eventosDodia = computed(() => {
  return eventos.value.filter(evento => 
    evento.data.toDateString() === diaSelecionado.value.toDateString()
  );
});

// Funções
const mesAnterior = () => {
  mesAtual.value = new Date(mesAtual.value.getFullYear(), mesAtual.value.getMonth() - 1, 1);
};

const proximoMes = () => {
  mesAtual.value = new Date(mesAtual.value.getFullYear(), mesAtual.value.getMonth() + 1, 1);
};

const selecionarDia = (dia) => {
  diaSelecionado.value = new Date(dia.data);
};

const irParaHoje = () => {
  const hoje = new Date();
  mesAtual.value = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  diaSelecionado.value = hoje;
};

onMounted(() => {
  // Inicializar no mês atual
  irParaHoje();
});
</script>

<style scoped>
.border-l-3 {
  border-left-width: 3px;
}
</style>

