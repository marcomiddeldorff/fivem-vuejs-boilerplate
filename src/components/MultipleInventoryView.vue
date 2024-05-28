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
import MoveItemModal from "@/components/MoveItemModal.vue";

interface Props {
   playerInventory: Array<Item>
   playerLimit: number;
   playerWeight: number;
   otherInventory: Array<Item>;
   otherLimit: number;
   otherWeight: number;
   otherType: string;
   otherIdentifier: string;
}

const props = defineProps<Props>();

const dropzoneThrow = ref(null);

const showAmountModal = ref(false);

const dropItem: Ref<UnwrapRef<Item | null>> = ref(null);

const inventoryItems = computed(() => {
   return props.playerInventory.filter((item) => (item.type == 'item' && item.count > 0) || item.type != 'item');
});

onMounted(() => {
   $(`.player-item-img`).draggable({
      appendTo: 'body',
      revert: true,
   })

   $(`.other-item-img`).draggable({
      appendTo: 'body',
      revert: true,
   })

   $('#playerItemList').droppable({
      over: function (event, ui) {
         const isSameItem = ui.draggable[0].classList.contains('player-item-img');
         if (isSameItem) return;

         $('#playerItemList').addClass('scale-105');
      },
      out: function (event, ui) {
         const isSameItem = ui.draggable[0].classList.contains('player-item-img');
         if (isSameItem) return;

         $('#playerItemList').removeClass('scale-105');
      },
      drop: function (event, ui) {
         const isSameItem = ui.draggable[0].classList.contains('player-item-img');
         if (isSameItem) return;
         $('#playerItemList').removeClass('scale-105');

         const id = $(ui.draggable[0]).attr('id');
         const result = id.split('item__player__');
         if (result.length <= 1) {
            console.log('[^1Error^0] An error occurred while you tried to drop your item. Please contact our development team for further assistance. Item id: ' + id)
            return;
         }

         const itemName = result[1];

         let foundItem: Item | null = null;

         for (let i = 0; i < props.otherInventory.length; i++) {
            const item = props.otherInventory[i];

            if (item.name == itemName) {
               foundItem = item;
               break;
            }
         }

         if (foundItem) {
            switch (foundItem.type) {
               case 'item':
                  openMoveItemModal(foundItem, 'player');
                  break;
               case 'weapon':
                  moveItemTarget.value = 'player';
                  moveItem.value = foundItem;
                  submitMoveItem(1);
                  break;
               case 'item_account':
                  openMoveItemModal(foundItem, 'player');
                  break;
            }
         }
      }
   })

   $('#otherItemList').droppable({
      over: function (event, ui) {
         const isSameItem = ui.draggable[0].classList.contains('other-item-img');
         if (isSameItem) return;

         $('#otherItemList').addClass('scale-105');
      },
      out: function (event, ui) {
         const isSameItem = ui.draggable[0].classList.contains('other-item-img');
         if (isSameItem) return;

         $('#otherItemList').removeClass('scale-105');
      },
      drop: function (event, ui) {
         const isSameItem = ui.draggable[0].classList.contains('other-item-img');
         if (isSameItem) return;
         $('#otherItemList').removeClass('scale-105');

         const id = $(ui.draggable[0]).attr('id');
         const result = id.split('item__player__');
         if (result.length <= 1) {
            console.log('[^1Error^0] An error occurred while you tried to drop your item. Please contact our development team for further assistance. Item id: ' + id)
            return;
         }

         const itemName = result[1];

         let foundItem: Item | null = null;

         for (let i = 0; i < props.playerInventory.length; i++) {
            const item = props.playerInventory[i];

            if (item.name == itemName) {
               foundItem = item;
               break;
            }
         }

         if (foundItem) {
            switch (foundItem.type) {
               case 'item':
                  openMoveItemModal(foundItem, 'other');
                  break;
               case 'weapon':
                  moveItemTarget.value = 'other';
                  moveItem.value = foundItem;
                  submitMoveItem(1);
                  break;
               case 'item_account':
                  openMoveItemModal(foundItem, 'other');
                  break;
            }
         }
      }
   })

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

         for (let i = 0; i < props.playerInventory.length; i++) {
            const item = props.playerInventory[i];

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

// const submitDropItem = (count: number) => {
//    api.post('throwItem', {
//       count,
//       item: dropItem.value
//    })
// }


// const showContextMenu = ref(false);
// const contextMenuItem: Ref<UnwrapRef<Item | null>> = ref(null);
// const contextMenuCoords = ref({x: 0, y: 0});
//
// const openContextMenu = (event, item: Item) => {
//    contextMenuItem.value = item;
//    showContextMenu.value = true;
//    contextMenuCoords.value = {
//       x: event.clientX,
//       y: event.clientY
//    }
// }

// const showPlayerList: Ref<UnwrapRef<boolean>> = ref(false);
// const playerList: Ref<UnwrapRef<number[]>> = ref([]);
//
// const openPlayerList = (players: number[]) => {
//    playerList.value = players;
//    showPlayerList.value = true;
// }

// const giveItemSelectedPlayerServerId: Ref<UnwrapRef<number | null>> = ref(null);
// const showGiveItemAmountModal = ref(false);
// const playerSelected = (playerServerId: number) => {
//    giveItemSelectedPlayerServerId.value = playerServerId;
//    showGiveItemAmountModal.value = true;
//    showPlayerList.value = false;
// }
//
// const giveItemToUser = (value: number) => {
//    api.post('giveItemToPlayer', {
//       count: value,
//       item: contextMenuItem.value,
//       playerId: giveItemSelectedPlayerServerId.value
//    })
// }

const showMoveItemModal = ref(false);
const moveItem: Ref<UnwrapRef<Item | null>> = ref(null);
const moveItemTarget: Ref<UnwrapRef<string | null>> = ref(null);

const openMoveItemModal = (item: Item, target: string) => {
   moveItem.value = item;
   showMoveItemModal.value = true;
   moveItemTarget.value = target;
}

const submitMoveItem = (value: number) => {
   api.post('moveItem', {
      count: value,
      item: moveItem.value,
      target: moveItemTarget.value
   });
   showMoveItemModal.value = false;
}

</script>

<template>
   <div class="bg-black/40 w-screen h-screen">
      <Info/>
      <div class="py-36 flex items-center justify-center h-screen">
         <!--         <ContextMenu :show="showContextMenu"-->
         <!--                      :item="contextMenuItem"-->
         <!--                      :coords="contextMenuCoords"-->
         <!--                      @close="showContextMenu = false"-->
         <!--                      @openPlayerList="players => openPlayerList(players)"-->
         <!--         />-->
         <MoveItemModal :item="moveItem"
                        :show="showMoveItemModal"
                        @close="showMoveItemModal = false"
                        @submit="value => submitMoveItem(value)"/>
         <!--         <PlayerList-->
         <!--            @playerSelected="playerServerId => playerSelected(playerServerId)"-->
         <!--            @close="showPlayerList = false"-->
         <!--            :coords="contextMenuCoords"-->
         <!--            :show="showPlayerList"-->
         <!--            :playerList="playerList"/>-->
         <!--         <DropItemModal @submit="count => submitDropItem(count)"-->
         <!--                        :item="dropItem"-->
         <!--                        :show="showAmountModal"-->
         <!--                        @close="showAmountModal = false"-->
         <!--         />-->
         <!--         <GiveItemAmountModal-->
         <!--            :item="contextMenuItem"-->
         <!--            :show="showGiveItemAmountModal"-->
         <!--            @close="showGiveItemAmountModal = false"-->
         <!--            :player-id="giveItemSelectedPlayerServerId"-->
         <!--            @submit="value => giveItemToUser(value)"-->
         <!--         />-->

         <div class="w-[790px] h-full relative">
            <div class="grid grid-cols-2 gap-8">
               <div class="flex pt-4 text-white h-full">
                  <div class="w-full relative">
                     <div class="bg-red-500/40 p-3 rounded mb-4 font-gilroyThin text-sm flex items-center gap-4"
                          v-if="Number(playerWeight) >= Number(playerLimit)">
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
                           <b id="playerCurrentWeight">{{ playerWeight?.toFixed(2) }} kg </b>
                           <span class="text-white/40">/ </span>
                           <span class="text-white/40">{{ playerLimit }} kg</span>
                        </div>
                     </div>
                     <div id="playerItemList" class="grid grid-cols-5 gap-2 transition-all">
                        <!--                           @contextmenu.prevent="openContextMenu($event, item)"-->
                        <div
                           v-for="item in inventoryItems" :key="item.name"
                        v-show="(item.type == 'item' && item.count > 0) || item.type != 'item'"
                        class="basis-[15%] relative item-${this.type} bg-black/30 rounded border border-black/30
                        shadow-lg hover:bg-gray/80 transition-all cursor-pointer h-16 w-16 flex items-center
                        justify-center">
                        <p class="absolute text-xs font-gilroyBold top-1 left-2">
                           {{ item.type == 'item' || item.type == 'item_account' ? item.count : item.ammo }}</p>
                        <img class="player-item-img"
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
            <div class="flex pt-4 text-white h-full">
               <div class="w-full relative">
                  <div class="bg-red-500/40 p-3 rounded mb-4 font-gilroyThin text-sm flex items-center gap-4"
                       v-if="Number(otherWeight) >= Number(otherLimit)">
                     <i class="fal fa-exclamation-circle"></i>
                     <p>Der Kofferraum dieses Fahzeuges ist voll!</p>
                  </div>
                  <div class="flex items-center justify-between mb-6 text-sm">
                     <div class="flex gap-4 items-center">
                        <div>
                           Kofferraum
                        </div>
                     </div>
                     <div>
                        <b id="playerCurrentWeight">{{ otherWeight?.toFixed(2) }} kg </b>
                        <span class="text-white/40">/ </span>
                        <span class="text-white/40">{{ otherLimit }} kg</span>
                     </div>
                  </div>
                  <div id="otherItemList" class="grid grid-cols-5 gap-2 transition-all">

                     <div
                        v-for="item in otherInventory" :key="item.name"
                        @contextmenu.prevent="openContextMenu($event, item)"
                        v-show="(item.type == 'item' && item.count > 0) || item.type != 'item'"
                        class="basis-[15%] relative item-${this.type} bg-black/30 rounded border border-black/30 shadow-lg hover:bg-gray/80 transition-all cursor-pointer h-16 w-16 flex items-center justify-center">
                        <p class="absolute text-xs font-gilroyBold top-1 left-2">
                           {{ item.type == 'item' || item.type == 'item_account' ? item.count : item.ammo }}</p>
                        <img class="other-item-img"
                             :id="`item__other__${item.name}`"
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
   </div>
</template>
