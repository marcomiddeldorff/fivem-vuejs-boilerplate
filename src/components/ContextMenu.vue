<script setup lang="ts">

import Item from "@/interfaces/Item";
import api from "@/api/axios";
import {onMounted} from "vue";

interface Props {
   show: boolean;
   item: Item;
   coords: { x: number; y: number }
}

const props = defineProps<Props>();
const emits = defineEmits(["close", "openPlayerList"])

onMounted(() => {
   $(document).click(function () {
      // Calling a timeout in order to catch a click event.
      setTimeout(() => {
         // If the context menu is currently visible we're going to hide it.
         if ($('#contextMenu').is(':visible')) {
            emits('close');
         }
      }, 100);
   });
})

const useItem = () => {
   emits('close');
   api.post('useItem', {
      item: props.item
   });
}

const giveItem = async () => {
   const result = await api.post('getClosestPlayers');

   emits('openPlayerList', result.data, props.item)
}

</script>

<template>
   <transition name="fadeInOut">
      <div id="contextMenu"
           v-show="show"
           class="z-[99] absolute rounded bg-black/40 border border-white/20 font-gilroyRegular text-white w-[200px] text-sm"
           :style="`top: ${coords.y + 20}px; left: ${coords.x + 20}px;`">
         <ul class="divide-y divide-white/20">
            <li @click="useItem"
                v-if="item?.usable"
                class="p-3 hover:bg-primary/60 transition-all font-gilroyMedium cursor-pointer">
               Benutzen
            </li>
            <li @click="giveItem" class="p-3 hover:bg-primary/60 transition-all font-gilroyMedium cursor-pointer">
               Geben
            </li>
         </ul>
      </div>
   </transition>
</template>

