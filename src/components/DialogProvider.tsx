"use client";

/**
 * Einheitliche Modal-Dialoge (Ersatz für window.confirm / window.prompt).
 *
 * Nutzung in einer Client-Komponente:
 *   const { confirm, form } = useDialogs();
 *
 *   if (!(await confirm({ title: "...", message: "...", confirmLabel: "Ja", variant: "danger" }))) return;
 *
 *   const values = await form({
 *     title: "Adresse bearbeiten",
 *     fields: [{ name: "address", label: "Adresse", value: "..." }],
 *   });
 *   if (!values) return; // abgebrochen
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, HelpCircle, Pencil } from "lucide-react";

type Variant = "default" | "danger";

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
};

export type FormField = {
  name: string;
  label: string;
  value?: string;
  placeholder?: string;
  multiline?: boolean;
};

export type FormOptions = {
  title: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
};

type DialogApi = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  form: (opts: FormOptions) => Promise<Record<string, string> | null>;
};

type ActiveDialog =
  | { kind: "confirm"; opts: ConfirmOptions; resolve: (v: boolean) => void }
  | { kind: "form"; opts: FormOptions; resolve: (v: Record<string, string> | null) => void };

const DialogContext = createContext<DialogApi | null>(null);

export function useDialogs(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialogs muss innerhalb des DialogProvider verwendet werden");
  return ctx;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<ActiveDialog | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setDialog({ kind: "confirm", opts, resolve });
      }),
    []
  );

  const form = useCallback(
    (opts: FormOptions) =>
      new Promise<Record<string, string> | null>((resolve) => {
        const initial: Record<string, string> = {};
        opts.fields.forEach((f) => (initial[f.name] = f.value ?? ""));
        setValues(initial);
        setDialog({ kind: "form", opts, resolve });
      }),
    []
  );

  const close = (result: boolean | Record<string, string> | null) => {
    if (!dialog) return;
    if (dialog.kind === "confirm") dialog.resolve(result === true);
    else dialog.resolve(result && typeof result === "object" ? result : null);
    setDialog(null);
  };

  // Escape = Abbrechen, Enter = Bestätigen (bei Bestätigungsdialogen)
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(dialog.kind === "confirm" ? false : null);
      if (e.key === "Enter" && dialog.kind === "confirm") close(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Erstes Eingabefeld fokussieren
  useEffect(() => {
    if (dialog?.kind === "form") setTimeout(() => firstInputRef.current?.focus(), 30);
  }, [dialog]);

  const isDanger = dialog?.kind === "confirm" && dialog.opts.variant === "danger";

  return (
    <DialogContext.Provider value={{ confirm, form }}>
      {children}

      {dialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close(dialog.kind === "confirm" ? false : null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {dialog.kind === "confirm" ? (
              <>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    isDanger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {isDanger ? <AlertTriangle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{dialog.opts.title}</h3>
                {dialog.opts.message && (
                  <p className="text-slate-600 mb-8 text-sm leading-relaxed whitespace-pre-line">{dialog.opts.message}</p>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => close(false)}
                    className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {dialog.opts.cancelLabel || "Abbrechen"}
                  </button>
                  <button
                    autoFocus
                    onClick={() => close(true)}
                    className={`px-4 py-2 font-medium text-white rounded-lg transition-colors ${
                      isDanger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {dialog.opts.confirmLabel || "Bestätigen"}
                  </button>
                </div>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  close(values);
                }}
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Pencil className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{dialog.opts.title}</h3>
                {dialog.opts.description && <p className="text-slate-500 text-sm mb-4">{dialog.opts.description}</p>}
                <div className="space-y-4 mt-4 mb-6">
                  {dialog.opts.fields.map((f, i) => (
                    <div key={f.name}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{f.label}</label>
                      {f.multiline ? (
                        <textarea
                          ref={i === 0 ? (el) => { firstInputRef.current = el; } : undefined}
                          value={values[f.name] ?? ""}
                          placeholder={f.placeholder}
                          rows={4}
                          onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                        />
                      ) : (
                        <input
                          ref={i === 0 ? (el) => { firstInputRef.current = el; } : undefined}
                          type="text"
                          value={values[f.name] ?? ""}
                          placeholder={f.placeholder}
                          onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => close(null)}
                    className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {dialog.opts.cancelLabel || "Abbrechen"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {dialog.opts.submitLabel || "Speichern"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
