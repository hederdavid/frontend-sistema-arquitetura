<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Estado para controlar se o submenu de projetos está aberto
const isProjetosMenuOpen = ref(false);

// Computed para verificar se estamos em uma rota relacionada a projetos
const isProjetosRoute = computed(() => {
  return route.path === "/projetos" || route.path === "/subprojetos";
});

// Watch para abrir/fechar o menu baseado na rota atual
watch(
  isProjetosRoute,
  (newValue) => {
    isProjetosMenuOpen.value = newValue;
  },
  { immediate: true }
);

// Função para toggle do menu de projetos
const toggleProjetosMenu = () => {
  isProjetosMenuOpen.value = !isProjetosMenuOpen.value;
};
</script>

<template>
  <aside
    class="col-span-2 bg-primary text-pale-rose flex flex-col h-full transition-all duration-300"
  >
    <h1 class="mb-4 border-b-2 border-pale-rose flex justify-center py-1">
      <img
        class="h-16"
        src="../../assets/logo-anne-beatriz.png"
        alt="Anne Beatriz Arquitetura e Interiores"
      />
    </h1>

    <button
    @click="$router.push('/projetos')"
      class="bg-pale-rose self-center max-w-52 justify-center rounded-3xl py-1 mx-4 mb-4 flex items-center px-4 text-primary font-bold transition-all transform duration-300 hover:scale-105"
    >
      <img src="../icons/add-icone.svg" alt="Ícone criar novo projeto" />
      <span class="text-primary font-bold">Criar Projeto</span>
    </button>
    <nav>
      <ul class="space-y-3">
        <li>
          <router-link
            to="/dashboard"
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-pale-rose hover:bg-opacity-10 cursor-pointer"
            exact-active-class="bg-pale-rose bg-opacity-25 border-l-4 pl-5 rounded-l"
          >
            <img class="w-8" src="../icons/casa.svg" alt="Ícone casa" />
            <span class="">Dashboard</span>
          </router-link>
        </li>

        <li class="group">
          <div
            @click="toggleProjetosMenu"
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-pale-rose hover:bg-opacity-10 cursor-pointer"
            :class="{
              'bg-pale-rose bg-opacity-25 border-l-4 pl-5 rounded-l':
                isProjetosRoute,
            }"
          >
            <img class="w-8" src="../icons/projetos.svg" alt="Ícone Projetos" />
            Projetos
            <img
              class="ml-16 transition-transform duration-300 group-hover:rotate-90"
              :class="{ 'rotate-90': isProjetosMenuOpen || isProjetosRoute }"
              src="../icons/seta.svg"
              alt="Ícone seta"
            />
          </div>
          <!-- Submenu que abre com hover OU quando está na rota de projetos -->
          <ul
            class="pl-12 transition-all duration-300 overflow-hidden group-hover:max-h-40 group-hover:opacity-100"
            :class="
              isProjetosMenuOpen || isProjetosRoute
                ? 'max-h-40 opacity-100'
                : 'max-h-0 opacity-0'
            "
          >
            <li>
              <router-link
                to="/projetos"
                class="block p-2 text-pale-rose text-xs relative group"
                :class="{ 'font-semibold': route.path === '/projetos' }"
              >
                <span
                  class="underline-effect"
                  :class="{ underlined: route.path === '/projetos' }"
                >
                  Visualizar projetos
                </span>
              </router-link>
            </li>

            <li>
              <router-link
                to="/subprojetos"
                class="block p-2 text-pale-rose text-xs relative group"
                :class="{ 'font-semibold': route.path === '/subprojetos' }"
              >
                <span
                  class="underline-effect"
                  :class="{ underlined: route.path === '/subprojetos' }"
                >
                  Subprojetos
                </span>
              </router-link>
            </li>
          </ul>
        </li>

        <li>
          <router-link
            to="/tarefas"
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-pale-rose hover:bg-opacity-10"
            active-class="bg-pale-rose bg-opacity-25 border-l-4 rounded-l"
          >
            <img class="w-8" src="../icons/tarefas.svg" alt="Ícone Tarefas" />
            Tarefas
          </router-link>
        </li>

        <li>
          <router-link
            to="/atendimentos"
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-pale-rose hover:bg-opacity-10"
            active-class="bg-pale-rose bg-opacity-25 border-l-4 rounded-l"
          >
            <img
              class="w-8"
              src="../icons/atendimentos.svg"
              alt="Ícone atendimentos"
            />
            Atendimentos
          </router-link>
        </li>

        <li>
          <router-link
            to="/clientes"
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-pale-rose hover:bg-opacity-10 cursor-pointer"
            active-class="bg-pale-rose bg-opacity-25 border-l-4 pl-5 rounded-l"
          >
            <img class="w-8" src="../icons/clientes.svg" alt="Ícone clientes" />
            Clientes
          </router-link>
        </li>

        <li>
          <div
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-pale-rose hover:bg-opacity-10 cursor-pointer"
          >
            <img
              class="w-8"
              src="../icons/documentos.svg"
              alt="Ícone relatórios"
            />
            Documentos
          </div>
        </li>

        <li>
          <div
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-pale-rose hover:bg-opacity-10 cursor-pointer"
          >
            <img
              class="w-8"
              src="../icons/tipos-documentos.svg"
              alt="Ícone relatórios"
            />
            Tipos de Documentos
          </div>
        </li>

        <li>
          <div
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-pale-rose hover:bg-opacity-10 cursor-pointer"
          >
            <img
              class="w-8"
              src="../icons/feedbacks.svg"
              alt="Ícone relatórios"
            />
            Feedbacks
          </div>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.underline-effect {
  position: relative;
}

.underline-effect::after {
  content: "";
  position: absolute;
  top: 110%;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: white;
  border-radius: 1rem;
  transition: width 0.3s ease, left 0.3s ease;
}

.underline-effect:hover::after {
  width: 100%;
  left: 0;
}

/* Estilo para quando o item está ativo/sublinhado */
.underline-effect.underlined::after {
  width: 100%;
  left: 0;
  background-color: #f3d2c1; /* cor pale-rose */
}

/* Transição suave para o submenu */
.max-h-0 {
  max-height: 0;
}

.max-h-40 {
  max-height: 10rem;
}

/* Rotação da seta */
.rotate-90 {
  transform: rotate(90deg);
}

/* Rotação da seta no hover do grupo */
.group:hover .group-hover\:rotate-90 {
  transform: rotate(90deg);
}

/* Animação para fade-in (mantida para compatibilidade) */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease;
}
</style>
