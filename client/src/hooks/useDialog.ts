import { useEffect, useRef, useState } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Exit transition runs at the fast duration (120ms); this buffer guarantees it finishes before unmount. */
const EXIT_MS = 150;

interface UseDialogOptions {
  open: boolean;
  onClose: () => void;
}

/**
 * Single owner of dialog enter/exit phasing plus the existing
 * trap/Escape/focus-return behavior (Story 5.5). Callers keep passing plain
 * `open`/`onClose`; the hook keeps the panel mounted while the exit
 * transition runs, then unmounts. Controls stay interactive from the first
 * frame — nothing is queued behind a transition.
 */
export function useDialog({ open, onClose }: UseDialogOptions) {
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  // Enter/exit phasing: mount instantly, flip to shown on the next frame so
  // the enter transition runs; on close, play the faster exit transition,
  // then unmount. Reduced-motion users skip the wait and unmount instantly
  // (their CSS durations are zeroed by the global kill switch).
  useEffect(() => {
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (open) {
      setMounted(true);
      setShown(false);
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => setShown(true));
      });
    } else {
      setShown(false);
      if (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        setMounted(false);
      } else {
        timer = setTimeout(() => setMounted(false), EXIT_MS);
      }
    }
    return () => {
      cancelAnimationFrame(raf);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [open ]);

  // Focus trap + Escape + focus return. Tied to `mounted` (not `open`) so the
  // trap stays live through the exit transition and focus returns only once
  // the panel actually unmounts.
  useEffect(() => {
    if (!mounted) return;

    openerRef.current = document.activeElement;

    const panel = panelRef.current;
    // Move focus inside the dialog on open.
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      // Return focus to the element that opened the dialog.
      const opener = openerRef.current as HTMLElement | null;
      if (opener && typeof opener.focus === 'function') {
        opener.focus();
      }
      openerRef.current = null;
    };
  }, [mounted]);

  return { panelRef, mounted, shown };
}

export default useDialog;
