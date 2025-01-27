import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState<{ title: string; description: string; status: "success" | "error" }[]>([]);

  const toast = ({ title, description, status }: { title: string; description: string; status: "success" | "error" }) => {
    setToasts([...toasts, { title, description, status }]);
    setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((t) => t !== { title, description, status }));
    }, 3000);
  };

  return { toast, toasts };
}
