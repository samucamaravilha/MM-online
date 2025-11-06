'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  tone?: 'success' | 'error' | 'info';
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleToast(event: CustomEvent<ToastMessage>) {
      setToasts((prev) => [...prev, event.detail]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== event.detail.id));
      }, 4000);
    }

    window.addEventListener('mm:toast', handleToast as EventListener);
    return () => window.removeEventListener('mm:toast', handleToast as EventListener);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="toaster">
      {toasts.map((toast) => (
        <div key={toast.id} className={clsx('toast', toast.tone)}>
          <strong>{toast.title}</strong>
          {toast.description ? <span>{toast.description}</span> : null}
        </div>
      ))}
      <style jsx>{`
        .toaster {
          position: fixed;
          top: 24px;
          right: 24px;
          display: grid;
          gap: 12px;
          z-index: 1000;
        }
        .toast {
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 4px solid var(--primary);
          padding: 16px 20px;
          border-radius: 16px;
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.35);
          display: grid;
          gap: 4px;
        }
        .toast.success {
          border-left-color: var(--success);
        }
        .toast.error {
          border-left-color: var(--danger);
        }
        .toast strong {
          font-weight: 600;
          color: var(--primary-text);
        }
        .toast span {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
      `}</style>
    </div>,
    document.body
  );
}

export function showToast(toast: Omit<ToastMessage, 'id'>) {
  const event = new CustomEvent<ToastMessage>('mm:toast', {
    detail: { id: crypto.randomUUID(), ...toast }
  });
  window.dispatchEvent(event);
}
