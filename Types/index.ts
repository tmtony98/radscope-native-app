export interface Message {
    id: string;
    topic: string;
    payload: String;
    timestamp: Date;
  }
  
  export interface ConnectionStatus {
    connected: boolean;
    error?: string;
  }
  