export interface NFCData {
    card_id?: string;
    terminal_id?: string;
    signal_strength?: number;
    raw_data?: any;
}

export class NFCService {
    private static isSupported: boolean = true;
    private static listeners: ((data: NFCData) => void)[] = [];

    static async checkNFCSupported(): Promise<boolean> {
        return Promise.resolve(true);
    }

    static async isEnabled(): Promise<boolean> {
        return Promise.resolve(true);
    }

    static async startNFCReading(): Promise<void> {
        console.log('Simulated NFC reading started');
        return Promise.resolve();
    }

    static async stopNFCReading(): Promise<void> {
        console.log('Simulated NFC reading stopped');
        this.listeners = [];
        return Promise.resolve();
    }

    static simulateNFCDetection(): NFCData {
        const nfcData: NFCData = {
            card_id: 'CARD_' + Math.random().toString(36).substr(2, 9),
            terminal_id: 'TERM_' + Math.random().toString(36).substr(2, 6),
            signal_strength: Math.floor(Math.random() * 60) - 80,
            raw_data: {
                timestamp: new Date().toISOString(),
                simulated: true
            }
        };

        this.listeners.forEach(listener => listener(nfcData));
        return nfcData;
    }

    static addListener(callback: (data: NFCData) => void): void {
        this.listeners.push(callback);
    }

    static async requestPermissions(): Promise<boolean> {
        return Promise.resolve(true);
    }
}