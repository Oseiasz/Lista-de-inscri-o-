
export interface Registration {
  id?: string;
  enrollmentNumber: string;
  name: string;
  phone: string;
  timestamp: number;
  transactionId?: string;
  paymentStatus?: 'pending' | 'confirmed';
}

export interface EventDetails {
  theme: string;
  audienceRules: string;
  time: string;
  price: string;
  address: string;
  phone: string;
  pixKey?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
