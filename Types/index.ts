export interface Message {
    id: string;
    topic: string;
    payload: string;
    timestamp: Date;
  }
  
  export interface ConnectionStatus {
    connected: boolean;
    error?: string;
  }
  