import React, { useState, useEffect, useRef } from 'react';

interface PromptDialogProps {
  message: string;
  defaultValue?: string;
  isPassword?: boolean;
  onSubmit: (result: string | null) => void;
}

export function PromptDialog({ message, defaultValue = '', isPassword = false, onSubmit }: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0b0f08] border border-[var(--border-gold)] rounded-lg shadow-[0_0_20px_rgba(223,177,37,0.3)] w-full max-w-md overflow-hidden">
        <div className="bg-[rgba(223,177,37,0.1)] px-4 py-3 border-b border-[rgba(223,177,37,0.3)]">
          <h3 className="text-[var(--accent-gold)] font-mono font-bold tracking-wider">{message}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <input
            ref={inputRef}
            type={isPassword ? "password" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white font-mono focus:border-[var(--accent-gold)] focus:outline-none transition-colors mb-6"
            placeholder={isPassword ? "Enter password..." : "Enter value..."}
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onSubmit(null)}
              className="px-4 py-2 border border-gray-600 text-gray-400 rounded hover:bg-white/5 transition-colors font-mono uppercase text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--accent-gold)] text-black font-bold rounded hover:brightness-110 transition-colors font-mono uppercase text-sm"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AlertDialogProps {
  message: string;
  onConfirm: () => void;
}

export function AlertDialog({ message, onConfirm }: AlertDialogProps) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0b0f08] border border-red-900/50 rounded-lg shadow-[0_0_20px_rgba(255,0,0,0.2)] w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <p className="text-gray-300 font-mono mb-6">{message}</p>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-900/50 text-red-200 border border-red-500/50 font-bold rounded hover:bg-red-800/50 transition-colors font-mono uppercase text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
