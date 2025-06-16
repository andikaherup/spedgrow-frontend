<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>NFC Payment</ion-title>
        <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
        <ion-buttons slot="start">
          <ion-button @click="closeModal">
            <ion-icon :icon="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="nfc-container">
        <!-- NFC Status Display -->
        <div class="nfc-status" :class="nfcStatus">
          <div class="nfc-icon-container">
            <ion-icon :icon="wifi" class="nfc-icon"></ion-icon>
            <div class="nfc-waves" v-if="isScanning">
              <div class="wave wave-1"></div>
              <div class="wave wave-2"></div>
              <div class="wave wave-3"></div>
            </div>
          </div>

          <h2>{{ statusMessage }}</h2>
          <p>{{ statusDescription }}</p>
        </div>

        <!-- Transaction Form -->
        <ion-card v-if="!isScanning && !transactionComplete" class="form-card">
          <ion-card-header>
            <ion-card-title>Transaction Details</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-input
                v-model="transactionData.amount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                label="Amount ($)"
                label-placement="stacked"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-input
                v-model="transactionData.merchant_name"
                placeholder="Enter merchant name"
                label="Merchant"
                label-placement="stacked"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-select
                v-model="transactionData.category"
                placeholder="Select category"
                label="Category"
                label-placement="stacked"
              >
                <ion-select-option value="food"
                  >Food & Dining</ion-select-option
                >
                <ion-select-option value="transport"
                  >Transport</ion-select-option
                >
                <ion-select-option value="shopping">Shopping</ion-select-option>
                <ion-select-option value="entertainment"
                  >Entertainment</ion-select-option
                >
                <ion-select-option value="other">Other</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <ion-button
            v-if="!isScanning && !transactionComplete"
            expand="block"
            size="large"
            @click="startNFCPayment"
            :disabled="!canStartPayment"
          >
            <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
            <ion-icon :icon="wifi" slot="start"></ion-icon>
            Start NFC Payment
          </ion-button>

          <ion-button
            v-if="isScanning"
            expand="block"
            size="large"
            color="danger"
            @click="cancelNFC"
          >
            <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
            <ion-icon :icon="close" slot="start"></ion-icon>
            Cancel
          </ion-button>

          <ion-button
            v-if="transactionComplete"
            expand="block"
            size="large"
            @click="resetTransaction"
          >
            <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
            <ion-icon :icon="add" slot="start"></ion-icon>
            New Transaction
          </ion-button>
        </div>

        <!-- Transaction Result -->
        <ion-card v-if="completedTransaction" class="result-card">
          <ion-card-header>
            <ion-card-title class="success-title">
              <ion-icon :icon="checkmarkCircle" color="success"></ion-icon>
              Transaction Complete
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>
                  <h3>Amount</h3>
                  <p class="amount-text">
                    {{
                      formatCurrency(
                        completedTransaction.amount,
                        completedTransaction.currency
                      )
                    }}
                  </p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>Merchant</h3>
                  <p>{{ completedTransaction.merchant_name }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>Transaction ID</h3>
                  <p class="transaction-id">
                    {{ completedTransaction.transaction_id }}
                  </p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>Status</h3>
                  <ion-badge color="success">COMPLETED</ion-badge>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonList,
  IonLabel,
  IonBadge,
} from "@ionic/vue";
import { wifi, close, checkmarkCircle, add } from "ionicons/icons";
import { NFCService, NFCData } from "../services/nfc";
import { TransactionService, Transaction } from "../services/api";

const emit = defineEmits(["close", "transaction-created"]);

const props = defineProps<{
  onSuccess?: () => void;
}>();

const isScanning = ref(false);
const transactionComplete = ref(false);
const nfcSupported = ref(true);
const completedTransaction = ref<Transaction | null>(null);

const transactionData = ref({
  amount: 0,
  merchant_name: "",
  category: "",
  currency: "USD",
  type: "debit" as const,
  status: "pending" as const,
});

const nfcStatus = computed(() => {
  if (transactionComplete.value) return "success";
  if (isScanning.value) return "scanning";
  return "ready";
});

const statusMessage = computed(() => {
  if (transactionComplete.value) return "Payment Successful!";
  if (isScanning.value) return "Tap your card";
  return "Ready for payment";
});

const statusDescription = computed(() => {
  if (transactionComplete.value)
    return "Your transaction has been processed successfully";
  if (isScanning.value) return "Hold your NFC card near the device";
  return "Fill in the transaction details below and tap Start NFC Payment";
});

const canStartPayment = computed(() => {
  return (
    transactionData.value.amount > 0 &&
    transactionData.value.merchant_name.trim() !== ""
  );
});

const closeModal = () => {
  emit("close");
};

const startNFCPayment = async () => {
  try {
    isScanning.value = true;
    await NFCService.startNFCReading();

    // Simulate NFC detection after 3 seconds
    setTimeout(() => {
      if (isScanning.value) {
        const simulatedData = NFCService.simulateNFCDetection();
        processNFCTransaction(simulatedData);
      }
    }, 3000);
  } catch (error) {
    console.error("Failed to start NFC payment:", error);
    isScanning.value = false;
  }
};

const processNFCTransaction = async (nfcData: NFCData) => {
  try {
    isScanning.value = false;

    const transactionPayload = {
      ...transactionData.value,
      nfc_data: nfcData,
      transaction_date: new Date().toISOString(),
      status: "completed" as const,
    };

    const result = await TransactionService.createTransaction(
      transactionPayload
    );

    completedTransaction.value = result;
    transactionComplete.value = true;

    await NFCService.stopNFCReading();
    if (props.onSuccess) {
      props.onSuccess();
    }
    emit("transaction-created");
  } catch (error) {
    console.error("Failed to process NFC transaction:", error);
    await cancelNFC();
  }
};

const cancelNFC = async () => {
  isScanning.value = false;
  await NFCService.stopNFCReading();
};

const resetTransaction = () => {
  transactionComplete.value = false;
  completedTransaction.value = null;
  transactionData.value = {
    amount: 0,
    merchant_name: "",
    category: "",
    currency: "USD",
    type: "debit",
    status: "pending",
  };
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

onMounted(async () => {
  nfcSupported.value = await NFCService.checkNFCSupported();
});

onUnmounted(async () => {
  if (isScanning.value) {
    await NFCService.stopNFCReading();
  }
});
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "NFCTransaction",
});
</script>

<style scoped>
.nfc-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  min-height: 100%;
}

.nfc-status {
  text-align: center;
  padding: 40px 20px;
  border-radius: 16px;
  margin-bottom: 20px;
}

.nfc-status.ready {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nfc-status.scanning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.nfc-status.success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.nfc-icon-container {
  position: relative;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.nfc-icon {
  font-size: 64px;
  position: relative;
  z-index: 2;
}

.nfc-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wave {
  position: absolute;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: wave-animation 2s infinite;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wave-1 {
  width: 80px;
  height: 80px;
  animation-delay: 0s;
}

.wave-2 {
  width: 120px;
  height: 120px;
  animation-delay: 0.5s;
}

.wave-3 {
  width: 160px;
  height: 160px;
  animation-delay: 1s;
}

@keyframes wave-animation {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

.form-card {
  margin: 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-card {
  margin: 0;
  border: 2px solid var(--ion-color-success);
}

.success-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ion-color-success);
}

.amount-text {
  font-size: 1.2em;
  font-weight: bold;
  color: var(--ion-color-success);
}

.transaction-id {
  font-family: monospace;
  font-size: 0.9em;
  color: var(--ion-color-medium);
}

.nfc-status h2 {
  margin: 16px 0 8px 0;
  font-size: 1.5em;
}

.nfc-status p {
  margin: 0;
  opacity: 0.9;
  font-size: 1em;
}
</style>
