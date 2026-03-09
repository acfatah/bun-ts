<template>
  <ul>
    <li v-for="(item, index) in todoItems" :key="index">
      {{ item.text }}
    </li>
    <li>
      <form @submit.prevent="submitNewTodo()">
        <input
          v-model="newTodo"
          type="text"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto p-2 mr-1 mb-1"
        />

        <button
          type="submit"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto p-2"
        >
          Add to-do
        </button>
      </form>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import type { Data } from "./+data";
import { useData } from "vike-vue/useData";
import { ref } from "vue";

const { todoItemsInitial } = useData<Data>();
const todoItems = ref<{ text: string }[]>(todoItemsInitial);
const newTodo = ref("");

const submitNewTodo = async () => {
  const text = newTodo.value;
  todoItems.value.push({ text });
  newTodo.value = "";

  const response = await fetch("/api/todo/create", {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  await response.blob();
};
</script>
