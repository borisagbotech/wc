"use client";
export default function Modal({ title, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-2xl border shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between bg-gradient-to-r from-white to-gray-50">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-5 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}
