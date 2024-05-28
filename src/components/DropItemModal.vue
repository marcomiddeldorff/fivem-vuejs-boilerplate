<script setup lang="ts">

import {computed, ref} from "vue";
import Item from "@/interfaces/Item";

interface Props {
  show: boolean;
  item: Item;
}

const props = defineProps<Props>();

const inputAmount = ref(1);

const emits = defineEmits(['submit', 'cancel', 'close']);

const errorMessage = ref("");

const submit = () => {
  if (inputAmount.value < 1) {
    errorMessage.value = "Bitte gebe einen Wert von mind. 1 ein.";
  } else if (isNaN(Number(inputAmount.value))) {
    errorMessage.value = "In diesem Feld sind nur Zahlen erlaubt."
  } else {
    errorMessage.value = "";
    emits('submit', inputAmount.value);
    emits('close');
    inputAmount.value = 1;
  }
}

const cancel = () => {
  inputAmount.value = 1;
  emits('close');
}

const disableButton = computed(() => {
  return !isNaN(Number(inputAmount.value)) && Number(inputAmount.value) > props.item?.count;
});

</script>

<template>
  <div class="absolute top-0 left-0 right-0 bottom-0 bg-black/30 z-[998]" v-show="show"></div>
  <transition name="zoomInOut">
    <div
        class="p-4 z-[999] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-black/40 rounded border border-white/20"
        v-show="show">
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-xl text-primary">
          Gegenstand ablegen
        </h3>
        <i class="fas fa-times text-lg text-red-500 cursor-pointer active:scale-95" @click="$emit('close')"></i>
      </div>
      <p class="mt-2 text-white/60">
        Bitte gebe die Anzahl des Gegenstandes ein, die du ablegen möchtest.
         <br>
         <br>
         <b>Gegenstand:</b> {{ item ? item.label : '' }}
      </p>
      <input v-model="inputAmount" type="number" min="1"
             class="w-full mt-4 bg-transparent border border-white/30 px-2 py-1 rounded focus:border-primary focus:outline-none focus:ring-0 text-white">
      <p class="text-red-500 text-sm" v-html="errorMessage"></p>
      <div class="flex items-center gap-x-2">
        <button :disabled="disableButton" @click.prevent="submit" type="button"
                class="bg-primary/60 hover:bg-primary disabled:hover:bg-primary/60 disabled:active:bg-primary/60 disabled:opacity-50 transition-all rounded active:bg-primary/30 mt-4 px-2 py-1 text-white border border-primary">
          Gegenstand ablegen
        </button>
        <button @click.prevent="cancel" type="button"
                class="bg-red-500/60 hover:bg-red-500 disabled:hover:bg-red-500/60 disabled:active:bg-red-500/60 transition-all rounded active:bg-red-500/30 mt-4 px-2 py-1 text-white border border-red-500">
          Abbrechen
        </button>
      </div>
    </div>
  </transition>
</template>
