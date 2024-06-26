declare global {
    interface Window {
      toast: (props: ToastProps) => void;
    }
  }
  
  export {};
  