import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Tailwind max-width utility; the shared shell keeps padding and scrolling consistent. */
  maxWidth?: string;
}

export default function Modal({ open, title, onClose, children, maxWidth = 'max-w-md' }: ModalProps) {
  const { panelRef, mounted, shown } = useDialog({ open, onClose });

  if (!mounted) return null;

  const motion = shown ? 'opacity-100 duration-base ease-out' : 'opacity-0 duration-fast ease-in';

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity ${motion}`}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`bg-white rounded-lg p-6 w-full ${maxWidth} mx-4 max-h-[90vh] overflow-y-auto focus:outline-none transition-opacity ${motion}`}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 flex items-center justify-center min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-md"
            aria-label="Close"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
