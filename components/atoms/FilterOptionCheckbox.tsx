type FilterOptionCheckboxProps = {
  sectionName: string;
  state: string[];
  value: string;
  icon: string;
  changeHandler: any;
};

export default function FilterOptionCheckbox({
  sectionName,
  state,
  value,
  icon,
  changeHandler,
}: FilterOptionCheckboxProps) {
  return (
    <div className="flex flex-col gap-2 rounded-md p-2 transition-colors hover:bg-slate-700 has-[:checked]:bg-slate-700">
      <label htmlFor={value}>
        {icon} {value}
      </label>
      <input
        type="checkbox"
        id={value}
        name={sectionName}
        value={value}
        checked={state.includes(value)}
        onChange={changeHandler}
      />
    </div>
  );
}
