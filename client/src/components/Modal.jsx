function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-primary">{title}</h3>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            x
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
