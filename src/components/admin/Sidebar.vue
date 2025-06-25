<template>
  <aside class="col-span-2 bg-primary text-pale-rose flex flex-col">
    <h1 class="mb-4 border-b-2 border-pale-rose flex justify-center py-1">
      <img
        class="h-16"
        src="../../assets/logo-anne-beatriz.png"
        alt="Anne Beatriz Arquitetura e Interiores"
      />
    </h1>

    <button
      class="bg-pale-rose self-center max-w-52 justify-center rounded-3xl py-1 mx-4 mb-4 flex items-center px-4 text-primary font-bold transition-all transform duration-300 hover:scale-105"
    >
      <img src="../icons/add-icone.svg" alt="Ícone criar novo projeto" />
      <span class="text-primary font-bold">Novo Projeto</span>
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
            class="flex items-center gap-2 p-1 pl-6 transition-all transform duration-300 hover:scale-105 hover:bg-pale-rose hover:bg-opacity-10 cursor-pointer"
          >
            <img class="w-8" src="../icons/projetos.svg" alt="Ícone Projetos" />
            Projetos
            <img
              class="ml-16 transition-transform duration-300 group-hover:rotate-90"
              src="../icons/seta.svg"
              alt="Ícone seta"
            />
          </div>
          <ul class="pl-12 hidden group-hover:block animate-fade-in">
            <li>
              <router-link
                to=""
                class="block p-2 text-pale-rose text-xs relative group"
              >
                <span class="underline-effect">Visualizar projetos</span>
              </router-link>
            </li>

            <li>
              <router-link
                to="/subprojetos"
                class="block p-2 text-pale-rose text-xs relative group"
              >
                <span class="underline-effect">Subprojetos</span>
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

.group-hover .group-hover\:rotate-90 {
  transform: rotate(90deg);
}

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
