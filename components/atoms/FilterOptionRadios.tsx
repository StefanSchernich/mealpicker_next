type FilterOptionsRadio = {
  sectionName: string;
  state: string;
  icon: string;
  value: string;
  changeHandler: any;
  isRequired: boolean;
};

export default function FilterOptionRadios({
  sectionName,
  state,
  icon,
  value,
  changeHandler,
  isRequired,
}: FilterOptionsRadio) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-gray-800 p-3 text-center transition-colors hover:bg-slate-700 has-[:checked]:bg-slate-700">
      <label htmlFor={value}>
        {icon} {value}
      </label>
      <input
        type="radio"
        id={value}
        className="hidden"
        name={sectionName}
        value={value}
        checked={state === value}
        onChange={changeHandler}
        required={isRequired}
      />
    </div>
  );
}
