import { useEffect } from "react";

const typeClassMap = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-brand-primary",
};

function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg ${typeClassMap[type] || typeClassMap.info}`}
    >
      {message}
    </div>
  );
}

export default Toast;
