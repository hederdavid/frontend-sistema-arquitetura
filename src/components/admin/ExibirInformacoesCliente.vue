<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "Dashboard",
  },
});

</script>

<template>
  <div>
    <ul class="flex justify-between mt-2 text-gray-800">
      <li class="basis-2/5">HEDER MOREIRA DAVID</li>
      <li class="basis-1/5">081.667.865-08</li>
      <li class="basis-1/5">(77) 99160-7631</li>
      <li class="basis-1/5">
        <div class="flex gap-2">
          <button class="text-blue-600 hover:underline">Editar</button>
          <button class="text-red-600 hover:underline">Excluir</button>
        </div>
      </li>
    </ul>
  </div>
</template>




