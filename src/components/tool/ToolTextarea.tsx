type ToolTextareaProps = {
  label?: React.ReactNode;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  rightLabel?: React.ReactNode;
  children?: React.ReactNode;
  textColor?: "default" | "accent";
};

export default function ToolTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
  readOnly = false,
  rightLabel,
  children,
  textColor = "default",
}: ToolTextareaProps) {
  return (
    <div className="space-y-2 w-full">
      {(label || rightLabel) && (
        <div className="flex justify-between">
          <label className="text-sm text-secondary">{label}</label>
          {rightLabel}
        </div>
      )}

      <div className="relative">
        <textarea
          rows={rows}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className={`custom-scrollbar w-full rounded-xl border border-border bg-surface p-4 font-mono text-sm outline-none focus:border-accent/50 ${
            textColor === "accent" ? "text-accent" : "text-primary"
          }`}
        />
            {children}
      </div>
    </div>
  );
}
