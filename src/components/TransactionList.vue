<!-- src/components/TransactionList.vue -->
<template>
  <div class="transaction-list">
    <ion-header>
      <ion-toolbar>
        <ion-title>Transaction History</ion-title>
        <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
        <ion-buttons slot="end">
          <ion-button @click="openFilters">
            <ion-icon :icon="filterOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Filter Section -->
      <ion-card v-if="showFilters" class="filter-card">
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-item>
                  <ion-label position="stacked">Type</ion-label>
                  <ion-select v-model="filters.type" placeholder="All">
                    <ion-select-option value="">All</ion-select-option>
                    <ion-select-option value="debit">Debit</ion-select-option>
                    <ion-select-option value="credit">Credit</ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
              <ion-col size="6">
                <ion-item>
                  <ion-label position="stacked">Status</ion-label>
                  <ion-select v-model="filters.status" placeholder="All">
                    <ion-select-option value="">All</ion-select-option>
                    <ion-select-option value="pending"
                      >Pending</ion-select-option
                    >
                    <ion-select-option value="completed"
                      >Completed</ion-select-option
                    >
                    <ion-select-option value="failed">Failed</ion-select-option>
                  </ion-select>
                </ion-item>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col>
                <ion-button expand="block" @click="applyFilters"
                  >Apply Filters</ion-button
                >
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <!-- Transaction Items -->
      <ion-list>
        <ion-item
          v-for="transaction in transactions"
          :key="transaction.id"
          @click="viewTransaction(transaction)"
        >
          <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
          <ion-avatar slot="start">
            <div class="transaction-icon" :class="transaction.type">
              <ion-icon
                :icon="transaction.type === 'credit' ? arrowUp : arrowDown"
              ></ion-icon>
            </div>
          </ion-avatar>

          <ion-label>
            <h2>{{ transaction.merchant_name || "Unknown Merchant" }}</h2>
            <p>{{ formatDate(transaction.transaction_date) }}</p>
            <p v-if="transaction.nfc_data" class="nfc-badge">
              <ion-icon :icon="wifi" size="small"></ion-icon> NFC
            </p>
          </ion-label>
          <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
          <ion-note slot="end" :class="transaction.type">
            {{ transaction.type === "credit" ? "+" : "-"
            }}{{ formatCurrency(transaction.amount, transaction.currency) }}
          </ion-note>
        </ion-item>
      </ion-list>

      <!-- Infinite Scroll -->
      <ion-infinite-scroll @ionInfinite="loadMore" :disabled="!hasMore">
        <ion-infinite-scroll-content
          loading-spinner="bubbles"
          loading-text="Loading more transactions..."
        >
        </ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonAvatar,
  IonIcon,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/vue";
import { filterOutline, arrowUp, arrowDown, wifi } from "ionicons/icons";
import { TransactionService, Transaction } from "../services/api";

const transactions = ref<Transaction[]>([]);
const showFilters = ref(false);
const filters = ref({
  type: "",
  status: "",
  nfc_only: false,
});
const currentPage = ref(1);
const hasMore = ref(true);

const openFilters = () => {
  showFilters.value = !showFilters.value;
};

const applyFilters = async () => {
  transactions.value = [];
  currentPage.value = 1;
  hasMore.value = true;
  await loadTransactions();
};

const loadTransactions = async () => {
  try {
    const params = {
      page: currentPage.value,
      per_page: 20,
      ...filters.value,
    };

    const response = await TransactionService.getTransactions(params);

    if (currentPage.value === 1) {
      transactions.value = response.data;
    } else {
      transactions.value.push(...response.data);
    }

    hasMore.value = response.current_page < response.last_page;
  } catch (error) {
    console.error("Failed to load transactions:", error);
  }
};

const loadMore = async (event: any) => {
  currentPage.value++;
  await loadTransactions();
  event.target.complete();
};

const viewTransaction = (transaction: Transaction) => {
  // Navigate to transaction detail
  console.log("View transaction:", transaction);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

onMounted(() => {
  loadTransactions();
});
</script>

<style scoped>
.filter-card {
  margin: 16px;
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

.transaction-icon.credit {
  background-color: var(--ion-color-success);
}

.transaction-icon.debit {
  background-color: var(--ion-color-danger);
}

.nfc-badge {
  color: var(--ion-color-primary);
  font-size: 0.8em;
  display: flex;
  align-items: center;
  gap: 4px;
}

ion-note.credit {
  color: var(--ion-color-success);
}

ion-note.debit {
  color: var(--ion-color-danger);
}
</style>
