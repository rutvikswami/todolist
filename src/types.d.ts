declare global {
  interface Window {
    openTaskModal?: (task?: any) => void;
  }
}

export {};