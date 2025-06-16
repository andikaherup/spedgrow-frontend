<template>
  <ion-page>
    <NFCTransaction
      @close="goBack"
      @transaction-created="onTransactionCreated"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage } from "@ionic/vue";
import { useRouter } from "vue-router";
import NFCTransaction from "../components/NFCTransaction.vue";

const router = useRouter();

const goBack = () => {
  router.back();
};

const onTransactionCreated = () => {
  router.push("/tabs/dashboard");
};
</script>
