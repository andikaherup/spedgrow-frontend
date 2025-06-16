<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/transactions"></ion-back-button>
        </ion-buttons>
        <ion-title>Transaction Details</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content v-if="transaction">
      <ion-card>
        <ion-card-header>
          <ion-card-title class="transaction-header">
            <div class="transaction-icon" :class="transaction.type">
              <ion-icon
                :icon="transaction.type === 'credit' ? arrowUp : arrowDown"
              ></ion-icon>
            </div>
            <div>
              <h1>
                {{ formatCurrency(transaction.amount, transaction.currency) }}
              </h1>
              <p class="transaction-type">
                {{ transaction.type.toUpperCase() }}
              </p>
            </div>
          </ion-card-title>
        </ion-card-header>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Details</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>
                <h3>Transaction ID</h3>
                <p>{{ transaction.transaction_id }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>Merchant</h3>
                <p>{{ transaction.merchant_name || "N/A" }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>Category</h3>
                <p>{{ transaction.category || "N/A" }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>Status</h3>
                <ion-badge :color="getStatusColor(transaction.status)">
                  {{ transaction.status.toUpperCase() }}
                </ion-badge>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>Date</h3>
                <p>{{ formatDateTime(transaction.transaction_date) }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-card v-if="transaction.nfc_data">
        <ion-card-header>
          <ion-card-title>
            <ion-icon :icon="wifi"></ion-icon>
            NFC Information
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item v-if="transaction.nfc_data.card_id">
              <ion-label>
                <h3>Card ID</h3>
                <p>{{ transaction.nfc_data.card_id }}</p>
              </ion-label>
            </ion-item>

            <ion-item v-if="transaction.nfc_data.terminal_id">
              <ion-label>
                <h3>Terminal ID</h3>
                <p>{{ transaction.nfc_data.terminal_id }}</p>
              </ion-label>
            </ion-item>

            <ion-item v-if="transaction.nfc_data.signal_strength">
              <ion-label>
                <h3>Signal Strength</h3>
                <p>{{ transaction.nfc_data.signal_strength }} dBm</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>

    <ion-content v-else>
      <div class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Loading transaction details...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonBadge,
  IonSpinner,
} from "@ionic/vue";
import { arrowUp, arrowDown, wifi } from "ionicons/icons";
import { TransactionService, Transaction } from "../services/api";

const route = useRoute();
const transaction = ref<Transaction | null>(null);

const loadTransaction = async () => {
  try {
    const id = parseInt(route.params.id as string);
    const data = await TransactionService.getTransaction(id);
    transaction.value = data;
  } catch (error) {
    console.error("Failed to load transaction:", error);
  }
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    default:
      return "medium";
  }
};

onMounted(() => {
  loadTransaction();
});
</script>

<style scoped>
.transaction-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.transaction-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.transaction-icon.credit {
  background-color: var(--ion-color-success);
}

.transaction-icon.debit {
  background-color: var(--ion-color-danger);
}

.transaction-type {
  color: var(--ion-color-medium);
  font-size: 0.9em;
  margin: 4px 0 0 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
}
</style>
