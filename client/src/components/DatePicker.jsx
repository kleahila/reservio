function DatePicker({ label, value, onChange, min }) {
  return (
    <label className="flex w-full flex-col gap-1 text-sm text-slate-700">
      {label}
      <input
        type="date"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-accent"
      />
    </label>
  );
}

export default DatePicker;
