<script setup lang="ts">
import {onMounted} from 'vue';

interface Props {
   show: boolean;
   playerList: number[];
   coords: {
      x: number;
      y: number;
   }
}

const props = defineProps<Props>();
const emits = defineEmits(["playerSelected", 'close']);

onMounted(() => {
   setTimeout(() => {
      $(document).click(function () {
         // Calling a timeout in order to catch a click event.
         // If the context menu is currently visible we're going to hide it.
         if ($('#playerList').is(':visible')) {
            emits('close');
         }
      });
   }, 200);
})

const playerSelected = (player: number) => {
   emits('playerSelected', player);
   emits('close');
}

</script>

<template>
   <transition name="fadeInOut">
      <ul id="playerList" v-show="show"
          class="absolute z-[150] rounded bg-black/40 border border-white/20 font-gilroyRegular text-white w-[200px] text-sm p-2"
          :style="`top: ${coords.y + 20}px; left: ${coords.x + 20}px;`">
         <li
            @click.prevent="playerSelected(player)"
            class="p-2 border-b last:border-b-0 hover:bg-primary/60 cursor-pointer transition-all hover:rounded"
            v-for="player in playerList" :key="player">
            Spielerid: {{ player }}
         </li>
      </ul>
   </transition>
</template>
