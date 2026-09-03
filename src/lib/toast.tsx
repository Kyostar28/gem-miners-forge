import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface ToastItem {
  id: string;
  icon?: string;
  title: string;
  detail?: string;
  color?: string;
  tone?: "ok" | "warn";
}

interface ToastCtx {
  push: (t: Omit<ToastItem, "id">) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(16).slice(2);
    setItems((l) => [...l, { ...t, id }]);
    setTimeout(() => setItems((l) => l.filter((x) => x.id !== id)), 5200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="cm-toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={`cm-toast ${t.tone === "warn" ? "is-warn" : "is-ok"}`}
            style={{ ["--toast" as string]: t.color ?? "var(--cm-green)" }}
          >
            <span className="cm-toast__icon" aria-hidden>{t.icon ?? (t.tone === "warn" ? "⚠" : "✔")}</span>
            <div className="cm-toast__body">
              <b>{t.title}</b>
              {t.detail ? <small>{t.detail}</small> : null}
            </div>
            <button
              type="button"
              className="cm-toast__x"
              aria-label="Cerrar aviso"
              onClick={() => setItems((l) => l.filter((x) => x.id !== t.id))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
