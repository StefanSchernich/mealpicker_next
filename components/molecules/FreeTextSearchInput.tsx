import { CirclePlus, CircleMinus } from "lucide-react";

type FreeTextSearchInputProps = {
  value: string;
  index: number;
  listLength: number;
  handleTextSearchChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
  handleTextSearchAdd: (index?: number) => void;
  handleTextSearchRemove: (
    e: React.MouseEvent<SVGSVGElement>,
    index: number,
  ) => void;
};

/**
 * Focuses on the next input element of type 'text' in the document.
 *
 * @return {void} This function does not return anything.
 */
function focusNext() {
  const textInputs = Array.from(
    document.querySelectorAll("input[type='text']"),
  );
  const currInput = document.activeElement;
  const currInputIndex = textInputs.indexOf(currInput!);
  const nextinputIndex = (currInputIndex + 1) % textInputs.length;
  const input = textInputs[nextinputIndex] as HTMLInputElement;
  input.focus();
}

export default function FreeTextSearchInput({
  value,
  index,
  listLength,
  handleTextSearchChange,
  handleTextSearchAdd,
  handleTextSearchRemove,
}: FreeTextSearchInputProps) {
  console.log("listLength: ", listLength);
  console.log("index: ", index);
  return (
    <div className="flex gap-2">
      <div className="max-w-64 grow">
        <input
          type="text"
          className="w-full rounded-md px-2 py-1 text-black"
          placeholder="Freitext Zutat"
          value={value}
          onChange={(e) => handleTextSearchChange(e, index)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              await handleTextSearchAdd(index);
              focusNext();
            }
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Show 'remove' button only if there is more than 1 item */}
        {listLength > 1 && (
          <CircleMinus onClick={(e) => handleTextSearchRemove(e, index)} />
        )}
        {/* Show 'add' button only at last item */}
        {listLength - 1 === index && (
          <CirclePlus onClick={(e) => handleTextSearchAdd()} />
        )}
      </div>
    </div>
  );
}
