import type { FieldError } from "react-hook-form";

const inputClasses =
  "mt-1.5 block w-full rounded-md border border-black/20 bg-white px-3 py-2 text-black focus:border-mcbride-blue focus:outline-none focus:ring-1 focus:ring-mcbride-blue";

export function FieldShell({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: FieldError;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-independence">
        {label}
        {required && <span className="text-marigold"> *</span>}
      </span>
      {hint && <span className="mt-1 block text-xs text-black/50">{hint}</span>}
      {children}
      {error && (
        <span className="mt-1 block text-xs font-medium text-red-600">
          {error.message}
        </span>
      )}
    </label>
  );
}

export const textInputClass = inputClasses;
export const selectInputClass = inputClasses;
export const textAreaClass = `${inputClasses} min-h-[6rem] resize-y`;

/**
 * For optional (or conditionally-required) enum <select> fields: an
 * untouched select's value is "", which is neither `undefined` nor a valid
 * enum member. Pass this as a register() option's setValueAs so an
 * unanswered optional question validates as unanswered, not as an invalid
 * option.
 */
export const emptyToUndefined = (v: string) => (v === "" ? undefined : v);
