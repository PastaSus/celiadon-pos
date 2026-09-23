import type { ReactNode } from 'react';
import { Box, X } from 'lucide-react';
import { useDialog } from '../hooks/useDialog';

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  id?: string;
}

// Left slide-in navigation drawer (Story 5.1). Same dialog behavior as Modal
// (scrim close, Escape close, focus trap, focus return), navy chrome to match
// the nav bar. Links, user meta, and Sign out render as children so the role
// filtering stays with the caller.
export default function NavDrawer({ open, onClose, children, id = 'mobile-nav' }: NavDrawerProps) {
  const { panelRef, mounted, shown } = useDialog({ open, onClose });

  if (!mounted) return null;

  const scrim = shown ? 'opacity-100 duration-base ease-out' : 'opacity-0 duration-fast ease-in';
  const panel = shown
    ? 'translate-x-0 duration-base ease-out'
    : '-translate-x-full duration-fast ease-in';

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity ${scrim}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        tabIndex={-1}
        className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto bg-ink p-4 focus:outline-none transition-transform ${panel}`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="sr-only">celiadon</span>
          <Box size={28} aria-hidden="true" className="text-accent" />
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white flex items-center justify-center min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink rounded-md"
            aria-label="Close navigation"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
