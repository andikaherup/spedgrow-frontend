<template>
  <div class="nfc-transaction">
    <ion-header>
      <ion-toolbar>
        <ion-title>NFC Payment</ion-title>
        <!-- eslint-disable-next-line vue/no-deprecated-slot-attribute -->
        <ion-buttons slot="start">
          <ion-button @click="$emit('close')">
            <ion-icon :icon="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="nfc-status-container">
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
        <ion-card v-if="!isScanning && !transactionComplete">
          <ion-card-header>
            <ion-card-title>Transaction Details</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Amount</ion-label>
              <ion-input
                v-model="transactionData.amount"
                type="number"
                step="0.01"
                placeholder="0.00"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Merchant</ion-label>
              <ion-input
                v-model="transactionData.merchant_name"
                placeholder="Merchant name"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Category</ion-label>
              <ion-select v-model="transactionData.category">
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
            color="danger"
            @click="cancelNFC"
          >
            Cancel
          </ion-button>

          <ion-button
            v-if="transactionComplete"
            expand="block"
            @click="resetTransaction"
          >
            New Transaction
          </ion-button>
        </div>

        <!-- Transaction Result -->
        <ion-card v-if="completedTransaction" class="result-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="checkmarkCircle" color="success"></ion-icon>
              Transaction Complete
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label>
                <h3>Amount</h3>
                <p>
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
                <p>{{ completedTransaction.transaction_id }}</p>
              </ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "NFCTransaction",
});
</script>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
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
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
} from "@ionic/vue";
import { wifi, close, checkmarkCircle } from "ionicons/icons";
import { NFCService, NFCData } from "../services/nfc";
import { TransactionService, Transaction } from "../services/api";

defineEmits(["close"]);

const isScanning = ref(false);
const transactionComplete = ref(false);
const nfcSupported = ref(false);
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
  if (transactionComplete.value) return "Payment Successful";
  if (isScanning.value) return "Tap your card";
  if (!nfcSupported.value) return "NFC not supported";
  return "Ready for payment";
});

const statusDescription = computed(() => {
  if (transactionComplete.value)
    return "Your transaction has been processed successfully";
  if (isScanning.value) return "Hold your NFC card near the device";
  if (!nfcSupported.value) return "This device does not support NFC";
  return "Fill in the transaction details and tap Start NFC Payment";
});

const canStartPayment = computed(() => {
  return (
    transactionData.value.amount > 0 &&
    transactionData.value.merchant_name.trim() !== "" &&
    nfcSupported.value
  );
});

const startNFCPayment = async () => {
  try {
    const hasPermission = await NFCService.requestPermissions();
    if (!hasPermission) {
      alert("NFC permissions are required for this feature");
      return;
    }

    const isEnabled = await NFCService.isEnabled();
    if (!isEnabled) {
      alert("Please enable NFC in your device settings");
      return;
    }

    isScanning.value = true;
    await NFCService.startNFCReading();

    // Simulate NFC detection after 3 seconds for demo
    setTimeout(() => {
      if (isScanning.value) {
        const simulatedData = NFCService.simulateNFCDetection();
        processNFCTransaction(simulatedData);
      }
    }, 3000);
  } catch (error) {
    console.error("Failed to start NFC payment:", error);
    alert("Failed to start NFC reading. Please try again.");
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
  } catch (error) {
    console.error("Failed to process NFC transaction:", error);
    alert("Transaction failed. Please try again.");
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
  nfcSupported.value = await NFCService.checkNFCSupport();
});

onUnmounted(async () => {
  if (isScanning.value) {
    await NFCService.stopNFCReading();
  }
});
</script>

<style scoped>
.nfc-status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 20px;
}

.nfc-status {
  text-align: center;
  padding: 40px 20px;
  border-radius: 16px;
  width: 100%;
  max-width: 300px;
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
}

.nfc-icon {
  font-size: 48px;
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
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: wave-animation 2s infinite;
}

.wave-1 {
  width: 60px;
  height: 60px;
  animation-delay: 0s;
}

.wave-2 {
  width: 80px;
  height: 80px;
  animation-delay: 0.5s;
}

.wave-3 {
  width: 100px;
  height: 100px;
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

.action-buttons {
  width: 100%;
  max-width: 300px;
}

.result-card {
  margin-top: 20px;
  border: 2px solid var(--ion-color-success);
}
</style>
