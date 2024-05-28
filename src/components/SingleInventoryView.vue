<script setup lang="ts">
import Info from '@/components/Info.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import ItemInfo from '@/components/ItemInfo.vue';
import {computed, onMounted, Ref, ref, UnwrapRef} from 'vue';
import PlayerList from "@/components/PlayerList.vue";
import Item from "@/interfaces/Item";
import api from "@/api/axios";
import DropItemModal from "@/components/DropItemModal.vue";
import GiveItemAmountModal from "@/components/GiveItemAmountModal.vue";

interface Props {
   inventory: Array<Item>
   limit: number;
   weight: number;
}

const props = defineProps<Props>();

const dropzoneThrow = ref(null);

const showAmountModal = ref(false);
const lastAmount = ref(null);

const dropItem: Ref<UnwrapRef<Item | null>> = ref(null);

const inventoryItems = computed(() => {
   return props.inventory.filter((item) => (item.type == 'item' && item.count > 0) || item.type != 'item');
});

onMounted(() => {
   for (let i = 0; i < props.inventory.length; i++) {
      const item = props.inventory[i];
      $(`.item-img`).draggable({
         appendTo: 'body',
         revert: true,
      })
   }

   $('#dropzoneThrow').droppable({
      over: function (event, ui) {
         const id = $(ui.draggable[0]).attr('id');
         const result = id.split('item__player__');

         dropzoneThrow.value.classList.add('bg-red-500/50', 'text-white');
      },
      out: function (event, ui) {
         dropzoneThrow.value.classList.remove('bg-red-500/50', 'text-white');
      },
      drop: function (event, ui) {
         dropzoneThrow.value.classList.remove('bg-red-500/50', 'text-white');
         const id = $(ui.draggable[0]).attr('id');
         const result = id.split('item__player__');
         if (result.length <= 1) {
            console.log('[^1Error^0] An error occurred while you tried to drop your item. Please contact our development team for further assistance. Item id: ' + id)
            return;
         }

         const itemName = result[1];
         let foundItem: Item | null = null;

         for (let i = 0; i < props.inventory.length; i++) {
            const item = props.inventory[i];

            if (item.name == itemName) {
               foundItem = item;
               break;
            }
         }

         if (foundItem) {
            dropItem.value = foundItem;

            switch (foundItem.type) {
               case 'item':
                  showAmountModal.value = true;
                  break;
               case 'weapon':
                  api.post('throwItem', {
                     count: 1,
                     item: foundItem
                  })
                  break;
               case 'item_account':
                  showAmountModal.value = true;
                  break;
            }
         } else {
            console.log('[^1Error^0] We could not find the item you were trying to drop out of your inventory. Please contact our development team for further assistance. Item id: ' + id)
         }
      }
   })
})

const submitDropItem = (count: number) => {
   api.post('throwItem', {
      count,
      item: dropItem.value
   })
}


const showContextMenu = ref(false);
const contextMenuItem: Ref<UnwrapRef<Item | null>> = ref(null);
const contextMenuCoords = ref({x: 0, y: 0});

const openContextMenu = (event, item: Item) => {
   contextMenuItem.value = item;
   showContextMenu.value = true;
   contextMenuCoords.value = {
      x: event.clientX,
      y: event.clientY
   }
}

const showPlayerList: Ref<UnwrapRef<boolean>> = ref(false);
const playerList: Ref<UnwrapRef<number[]>> = ref([]);

const openPlayerList = (players: number[]) => {
   playerList.value = players;
   showPlayerList.value = true;
}

const giveItemSelectedPlayerServerId: Ref<UnwrapRef<number | null>> = ref(null);
const showGiveItemAmountModal = ref(false);
const playerSelected = (playerServerId: number) => {
   giveItemSelectedPlayerServerId.value = playerServerId;
   showGiveItemAmountModal.value = true;
   showPlayerList.value = false;
}

const giveItemToUser = (value: number) => {
   api.post('giveItemToPlayer', {
      count: value,
      item: contextMenuItem.value,
      playerId: giveItemSelectedPlayerServerId.value
   })
}

</script>

<template>
   <div class="bg-black/40 w-screen h-screen">
      <Info/>
      <div class="py-36 flex items-center justify-center h-screen">
         <ContextMenu :show="showContextMenu"
                      :item="contextMenuItem"
                      :coords="contextMenuCoords"
                      @close="showContextMenu = false"
                      @openPlayerList="players => openPlayerList(players)"
         />
         <PlayerList
            @playerSelected="playerServerId => playerSelected(playerServerId)"
            @close="showPlayerList = false"
            :coords="contextMenuCoords"
            :show="showPlayerList"
            :playerList="playerList"/>
         <DropItemModal @submit="count => submitDropItem(count)"
                        :item="dropItem"
                        :show="showAmountModal"
                        @close="showAmountModal = false"
         />
         <GiveItemAmountModal
            :item="contextMenuItem"
            :show="showGiveItemAmountModal"
            @close="showGiveItemAmountModal = false"
            :player-id="giveItemSelectedPlayerServerId"
            @submit="value => giveItemToUser(value)"
         />

         <div class="w-[790px] h-full relative">
            <div class="border-b-2 border-white/10 py-4">
               <ul class="flex items-center justify-center gap-6 uppercase font-gilroyBold">
                  <li class="px-3 py-1.5 rounded text-primary bg-black/40 shadow transition-all cursor-pointer">Deine
                     Taschen
                  </li>
                  <li
                     class="px-3 py-1.5 text-white rounded hover:bg-white/40 hover:text-primary transition-all cursor-pointer line-through">
                     Herstellung
                  </li>
               </ul>
            </div>
            <div class="flex pt-4 text-white h-full">
               <div class="w-full relative">
                  <div class="bg-red-500/40 p-3 rounded mb-4 font-gilroyThin text-sm flex items-center gap-4"
                       v-if="Number(weight) >= Number(limit)">
                     <i class="fal fa-exclamation-circle"></i>
                     <p>Deine Taschen sind voll!</p>
                  </div>
                  <div class="flex items-center justify-between mb-6 text-sm">
                     <div class="flex gap-4 items-center">
                        <div>
                           Dein Inventar
                        </div>
                     </div>
                     <div>
                        <b id="playerCurrentWeight">{{ weight.toFixed(2) }} kg </b>
                        <span class="text-white/40">/ </span>
                        <span class="text-white/40">{{ limit }} kg</span>
                     </div>
                  </div>
                  <div id="playerItemList" class="grid grid-cols-10 gap-2 transition-all">

                     <div
                        v-for="item in inventoryItems" :key="item.name"
                        @contextmenu.prevent="openContextMenu($event, item)"
                        v-show="(item.type == 'item' && item.count > 0) || item.type != 'item'"
                        class="basis-[15%] relative item-${this.type} bg-black/30 rounded border border-black/30 shadow-lg hover:bg-gray/80 transition-all cursor-pointer h-16 w-16 flex items-center justify-center">
                        <p class="absolute text-xs font-gilroyBold top-1 left-2">
                           {{ item.type == 'item' || item.type == 'item_account' ? item.count : item.ammo }}</p>
                        <img class="item-img"
                             :id="`item__player__${item.name}`"
                             :src="`https://cfx-nui-dc_inventory/html/assets/images/${item.name}.png`"
                             onerror="this.src='https://cfx-nui-dc_inventory/html/assets/images/dc.png'"
                             :alt="item.label">
                     </div>
                     <div v-for="x in (30 - inventoryItems.length)">
                        <div
                           class="basis-[15%] item-${this.type}-placeholder bg-black/30 rounded border border-black/30 shadow-lg h-16 w-16 flex items-center justify-center"></div>
                     </div>
                  </div>
               </div>
               <div>
                  <div id="dropzoneThrow" ref="dropzoneThrow"
                       class="dropzone-throw transition-all border-dashed text-red-500 border-red-500 transition-all absolute z-[99] border-2 bottom-0 rounded left-[50%] translate-x-[-50%] w-[500px] h-[100px]">
                     <div class="relative w-full h-full">
                        <div
                           class="absolute top-[50%] text-center left-[50%] translate-x-[-50%] translate-y-[-50%] font-gilroyRegular text-sm transition-all">
                           Ziehe Gegenstände hierhin, um diese wegzuwerfen
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>
