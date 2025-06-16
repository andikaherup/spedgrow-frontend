import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Transaction {
    id: number;
    transaction_id: string;
    amount: number;
    currency: string;
    type: 'debit' | 'credit';
    status: 'pending' | 'completed' | 'failed';
    merchant_name?: string;
    category?: string;
    nfc_data?: any;
    transaction_date: string;
    created_at: string;
    updated_at: string;
}

export interface TransactionSummary {
    total_transactions: number;
    total_amount: number;
    credit_amount: number;
    debit_amount: number;
    nfc_transactions: number;
    pending_transactions: number;
    completed_transactions: number;
    failed_transactions: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export class TransactionService {
    static async getTransactions(params: any = {}): Promise<PaginatedResponse<Transaction>> {
        const response = await api.get('/transactions', { params });
        return response.data;
    }

    static async getTransaction(id: number): Promise<Transaction> {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    }

    static async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
        const response = await api.post('/transactions', transaction);
        return response.data;
    }

    static async getSummary(startDate?: string, endDate?: string): Promise<TransactionSummary> {
        const params = { start_date: startDate, end_date: endDate };
        const response = await api.get('/transactions/stats/summary', { params });
        return response.data;
    }

    static async getRecentNfcTransactions(): Promise<Transaction[]> {
        const response = await api.get('/transactions/nfc/recent');
        return response.data;
    }
}

export default api;