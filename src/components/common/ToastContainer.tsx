import { ToastProvider, ToastViewport } from '../ui/toast';

export default function ToastContainer() {
  // The actual toasts are rendered via the useToast hook pattern
  // This wraps the app with the ToastProvider
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  );
}
