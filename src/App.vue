<template>
  <!-- Your content -->
</template>

<script setup lang="ts">
import {
  Ref,
  ShallowRef,
  ref,
  shallowRef,
  Component,
  onMounted,
  onUnmounted,
} from "vue";
import { useGlobalStore } from "./store/global";

interface Handlers {
  [key: string]: (itemData: any) => void;
}

const handlers: Handlers = {
  // exampleEvent: (itemData: ExampleInterface): void => {

  // },
}

const handleMessageListener = (event: MessageEvent): void => {
  const itemData: any = event?.data;
  if (handlers[itemData.type]) handlers[itemData.type](itemData);
};


onMounted(() => {
  window.addEventListener("message", handleMessageListener);
});

onUnmounted(() => {
  window.removeEventListener("message", handleMessageListener, false);
});
</script>