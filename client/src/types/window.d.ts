declare global {
  interface Window {
    assessmentContext?: {
      updateClientId: (clientId: string) => void;
    };
  }
}

export {};