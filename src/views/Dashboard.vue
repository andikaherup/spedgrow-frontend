<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
        <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
        <ion-buttons slot="end">
          <ion-button @click="refreshData">
            <ion-icon :icon="refresh"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Summary Cards -->
      <div class="summary-grid">
        <ion-card class="summary-card">
          <ion-card-content>
            <div class="summary-content">
              <div class="summary-icon credit">
                <ion-icon :icon="trendingUp"></ion-icon>
              </div>
              <div class="summary-details">
                <h2>{{ formatCurrency(summary.credit_amount, "USD") }}</h2>
                <p>Total Credits</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="summary-card">
          <ion-card-content>
            <div class="summary-content">
              <div class="summary-icon debit">
                <ion-icon :icon="trendingDown"></ion-icon>
              </div>
              <div class="summary-details">
                <h2>{{ formatCurrency(summary.debit_amount, "USD") }}</h2>
                <p>Total Debits</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="summary-card">
          <ion-card-content>
            <div class="summary-content">
              <div class="summary-icon nfc">
                <ion-icon :icon="wifi"></ion-icon>
              </div>
              <div class="summary-details">
                <h2>{{ summary.nfc_transactions }}</h2>
                <p>NFC Transactions</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card class="summary-card">
          <ion-card-content>
            <div class="summary-content">
              <div class="summary-icon pending">
                <ion-icon :icon="time"></ion-icon>
              </div>
              <div class="summary-details">
                <h2>{{ summary.pending_transactions }}</h2>
                <p>Pending</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Quick Actions -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Quick Actions</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="quick-actions">
            <ion-button
              expand="block"
              @click="openNFCPayment"
              :disabled="!nfcSupported"
            >
              <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
              <ion-icon :icon="wifi" slot="start"></ion-icon>
              New NFC Payment
            </ion-button>
            <ion-button
              expand="block"
              fill="outline"
              @click="viewAllTransactions"
            >
              <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
              <ion-icon :icon="list" slot="start"></ion-icon>
              View All Transactions
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Recent NFC Transactions -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Recent NFC Transactions</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list v-if="recentNfcTransactions.length > 0">
            <ion-item
              v-for="transaction in recentNfcTransactions"
              :key="transaction.id"
            >
              <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
              <ion-avatar slot="start">
                <div class="transaction-icon nfc">
                  <ion-icon :icon="wifi"></ion-icon>
                </div>
              </ion-avatar>
              <ion-label>
                <h3>{{ transaction.merchant_name }}</h3>
                <p>{{ formatDate(transaction.transaction_date) }}</p>
              </ion-label>
              <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
              <ion-note slot="end" :class="transaction.type">
                {{ transaction.type === "credit" ? "+" : "-"
                }}{{ formatCurrency(transaction.amount, transaction.currency) }}
              </ion-note>
            </ion-item>
          </ion-list>
          <div v-else class="no-transactions">
            <p>No NFC transactions yet</p>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- NFC Payment Modal -->
      <ion-modal :is-open="showNFCModal" @did-dismiss="showNFCModal = false">
        <NFCTransaction @close="showNFCModal = false" />
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
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
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonAvatar,
  IonModal,
} from "@ionic/vue";
import {
  refresh,
  trendingUp,
  trendingDown,
  wifi,
  time,
  list,
} from "ionicons/icons";
import {
  TransactionService,
  Transaction,
  TransactionSummary,
} from "../services/api";
import { NFCService } from "@/services/nfc";
import NFCTransaction from "@/components/NFCTransaction.vue";

const summary = ref<TransactionSummary>({
  total_transactions: 0,
  total_amount: 0,
  credit_amount: 0,
  debit_amount: 0,
  nfc_transactions: 0,
  pending_transactions: 0,
  completed_transactions: 0,
  failed_transactions: 0,
});

const recentNfcTransactions = ref<Transaction[]>([]);
const nfcSupported = ref(false);
const showNFCModal = ref(false);

const loadSummary = async () => {
  try {
    const data = await TransactionService.getSummary();
    summary.value = data;
  } catch (error) {
    console.error("Failed to load summary:", error);
  }
};

const loadRecentNfcTransactions = async () => {
  try {
    const data = await TransactionService.getRecentNfcTransactions();
    recentNfcTransactions.value = data.slice(0, 5); // Show only 5 recent
  } catch (error) {
    console.error("Failed to load recent NFC transactions:", error);
  }
};

const refreshData = async () => {
  await Promise.all([loadSummary(), loadRecentNfcTransactions()]);
};

const openNFCPayment = () => {
  showNFCModal.value = true;
};

const viewAllTransactions = () => {
  // Navigate to transaction list
  console.log("Navigate to transaction list");
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

onMounted(async () => {
  nfcSupported.value = await NFCService.checkNFCSupported();
  await refreshData();
});
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 16px;
}

.summary-card {
  margin: 0;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.summary-icon.credit {
  background-color: var(--ion-color-success);
}

.summary-icon.debit {
  background-color: var(--ion-color-danger);
}

.summary-icon.nfc {
  background-color: var(--ion-color-primary);
}

.summary-icon.pending {
  background-color: var(--ion-color-warning);
}

.summary-details h2 {
  margin: 0;
  font-size: 1.2em;
  font-weight: bold;
}

.summary-details p {
  margin: 4px 0 0 0;
  color: var(--ion-color-medium);
  font-size: 0.9em;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.transaction-icon.nfc {
  background-color: var(--ion-color-primary);
}

.no-transactions {
  text-align: center;
  padding: 20px;
  color: var(--ion-color-medium);
}

ion-note.credit {
  color: var(--ion-color-success);
}

ion-note.debit {
  color: var(--ion-color-danger);
}
</style>
