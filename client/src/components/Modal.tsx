import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Tailwind max-width utility; the shared shell keeps padding and scrolling consistent. */
  maxWidth?: string;
}

export default function Modal({ open, title, onClose, children, maxWidth = 'max-w-md' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 w-full ${maxWidth} mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}