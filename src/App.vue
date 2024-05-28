<script setup lang="ts">
import {
   Ref,
   ShallowRef,
   ref,
   shallowRef,
   Component,
   onMounted,
   onUnmounted,
   UnwrapRef,
} from "vue";
import api from "./api/axios";
import SingleInventoryView from './components/SingleInventoryView.vue';
import MultipleInventoryView from "@/components/MultipleInventoryView.vue";

interface Handlers {
   [key: string]: (itemData: any) => void;
}

const inventory: Ref<UnwrapRef<null | Array<object>>> = ref(null);
const openType: Ref<UnwrapRef<null | string>> = ref(null);
const limit: Ref<UnwrapRef<null | number>> = ref(null);
const weight: Ref<UnwrapRef<null | number>> = ref(null);

const otherLimit: Ref<UnwrapRef<number>> = ref(0);
const otherWeight: Ref<UnwrapRef<number>> = ref(0);
const otherType: Ref<UnwrapRef<string>> = ref("");
const otherInventory: Ref<UnwrapRef<null | Array<object>>> = ref(null);
const otherIdentifier: Ref<UnwrapRef<string>> = ref("");

const itemNotifications: Ref<UnwrapRef<Array<{
   label: string;
   count: number;
   type: string;
   timeout: number;
}>>> = ref([]);

onMounted(() => {
   setInterval(() => {
      for (let i = 0; i < itemNotifications.value.length; i++) {
         const notify = itemNotifications.value[i];

         if (notify.timeout == 0) {
            itemNotifications.value.splice(i, 1);
         }

         if (notify.timeout > 0) {
            itemNotifications.value[i].timeout = itemNotifications.value[i].timeout - 1000;
         }

      }
   }, 1000);
})

const handlers: Handlers = {
   open: (itemData): void => {
      openType.value = itemData.openType;
      switch (itemData.openType) {
         case 'single':
            inventory.value = itemData.inv;
            openType.value = itemData.openType;
            limit.value = itemData.limit;
            weight.value = itemData.weight;
            break;
         case 'multiple':
            inventory.value = itemData.playerInventory.inventory;
            limit.value = itemData.playerInventory.maxWeight;
            weight.value = itemData.playerInventory.currentWeight;
            otherInventory.value = itemData.otherInventory.inventory;
            otherLimit.value = itemData.otherInventory.maxWeight;
            otherWeight.value = itemData.otherInventory.currentWeight;
            if (itemData.hasOwnProperty('plate')) {
               otherType.value = 'vehicle';
               otherIdentifier.value = itemData.plate;
            }
            break;
      }
   },
   updateInventory: (itemData): void => {
      inventory.value = itemData.inventory;
      weight.value = itemData.weight;
   },
   updateMultipleInventories: (itemData): void => {
      inventory.value = itemData.playerInventory.inventory;
      limit.value = itemData.playerInventory.maxWeight;
      weight.value = itemData.playerInventory.currentWeight;
      otherInventory.value = itemData.otherInventory.inventory;
      otherLimit.value = itemData.otherInventory.maxWeight;
      otherWeight.value = itemData.otherInventory.currentWeight;
      if (itemData.hasOwnProperty('plate')) {
         otherType.value = 'vehicle';
         otherIdentifier.value = itemData.plate;
      }
   },
   showInventoryItemNotification: (itemData): void => {
      itemNotifications.value.push({
         label: itemData.label,
         count: itemData.count,
         type: itemData.type,
         timeout: 5000
      })
   }
}

const handleMessageListener = (event: MessageEvent): void => {
   const itemData: any = event?.data;
   if (handlers[itemData.action]) handlers[itemData.action](itemData);
};


onMounted(() => {
   window.addEventListener("message", handleMessageListener);

   window.addEventListener('keydown', (e) => {
      if (e.key == 'Escape') {
         openType.value = null;
         api.post('close');
      }
   })
});

onUnmounted(() => {
   window.removeEventListener("message", handleMessageListener, false);
});
</script>

<template>
   <div class="overflow-hidden">
      <SingleInventoryView
         :weight="weight"
         :limit="limit"
         :inventory="inventory"
         v-if="openType == 'single'"/>
      <MultipleInventoryView
         v-if="openType == 'multiple'"
         :playerLimit="limit"
         :playerWeight="weight"
         :playerInventory="inventory"
         :otherLimit="otherLimit"
         :otherWeight="otherWeight"
         :otherInventory="otherInventory"
         :otherType="otherType"
         :otherIdentifier="otherIdentifier"
      />
      <div>
         <div class="absolute bottom-10 right-10 space-y-4">
            <transition-group name="slideInOut">
               <div class="rounded-lg bg-black/40 border-l-2 font-gilroyRegular text-white p-4 gap-x-2 min-w-[300px]"
                    v-for="notify in itemNotifications"
                    :class="[notify.type == 'add' ? 'border-green-500' : 'border-red-500']">
                  <h2 :class="[notify.type == 'add' ? 'text-green-500' : 'text-red-500', 'font-bold text-sm']">
                     Gegenstand {{ notify.type == 'add' ? 'hinzugefügt' : 'entfernt' }}
                  </h2>
                  <p class="text-white/60 text-sm mt-1">{{ notify.count }}x {{ notify.label }}</p>
               </div>
            </transition-group>
         </div>
      </div>
   </div>
</template>


<style scoped>
.slideInOut-leave-active,
.slideInOut-enter-active {
   transition: all 0.5s;
}

.slideInOut-enter-from,
.slideInOut-leave-to {
   transform: translateX(400px);
}
</style>
