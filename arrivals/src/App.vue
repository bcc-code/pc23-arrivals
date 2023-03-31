<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import ArrivalScreen1 from "./ArrivalScreen1.vue";
import ArrivalScreen2 from "./ArrivalScreen2.vue";
// @ts-ignore
import { decrypt } from "./decrypt.js";
import { secret } from "./.secret";

const password = ref(localStorage.getItem("pass") ?? "");
const apiKey = ref<string | null>();
const screen = ref(0);
const screenCount = 2;

const onKeyUp = (e: KeyboardEvent) => {
  console.log(e);
  if (!e.shiftKey || e.code !== "Digit1") return;
  screen.value += 1;
  if (screen.value == screenCount) {
    screen.value = 0;
  }
};
document.addEventListener("keyup", onKeyUp);
onUnmounted(() => {
  removeEventListener("keyup", onKeyUp);
});

async function open(): Promise<void> {
  apiKey.value = await decrypt(secret, password.value);
  localStorage.setItem("pass", password.value);
}

if (password.value != null) {
  open();
}
</script>

<template>
  <div v-if="apiKey == null">
    <div class="w-full h-screen flex flex-col items-center justify-center">
      <div class="flex items-center">
        <label
          class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
          for="inline-password"
        >
          Password
        </label>
        <input
          class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          id="inline-password"
          type="password"
          placeholder=""
          v-model="password"
          @keyup.enter="open"
          @submit="open"
        />
        <button
          class="mx-4 shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
          @click="open"
        >
          Open
        </button>
      </div>
    </div>
  </div>
  <template v-else>
    <ArrivalScreen1 :apiKey="apiKey" v-if="screen == 1" />
    <ArrivalScreen2 :apiKey="apiKey" v-else />
  </template>
</template>
