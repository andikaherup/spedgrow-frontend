<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="home"></ion-icon>
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="transactions" href="/tabs/transactions">
          <ion-icon :icon="list"></ion-icon>
          <ion-label>Transactions</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="nfc" href="/tabs/nfc">
          <ion-icon :icon="wifi"></ion-icon>
          <ion-label>NFC Pay</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
} from "@ionic/vue";
import { home, list, wifi } from "ionicons/icons";
</script>
