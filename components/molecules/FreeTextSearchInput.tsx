import { CirclePlus, CircleMinus } from "lucide-react";

type FreeTextSearchInputProps = {
  value: string;
  index: number;
  listLength: number;
  handleTextSearchChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
  handleTextSearchAdd: () => void;
  handleTextSearchRemove: (
    e: React.MouseEvent<SVGSVGElement>,
    index: number,
  ) => void;
  isInFilter?: boolean; // for applying different logic to added ingredient search terms: add/edit -> insert after current/active input; filter -> always insert at end
};

/**
 * Focuses on the next input element of type 'text' in the document.
 *
 * @return {void} This function does not return anything.
 */
function focusNext() {
  const textInputs = Array.from(
    document.querySelectorAll("input[data-id='ingredient-input']"),
  );
  const currInput = document.activeElement;
  const currInputIndex = textInputs.indexOf(currInput!);
  const nextinputIndex = (currInputIndex + 1) % textInputs.length;
  const input = textInputs[nextinputIndex] as HTMLInputElement;
  input.focus();
}

/**
 * Focuses on the last input element with the data-id attribute set to 'ingredient-input'.
 *
 * @return {void} This function does not return anything.
 */
function focusLast() {
  const textInputs = Array.from(
    document.querySelectorAll("input[data-id='ingredient-input']"),
  );
  const lastInput = textInputs.at(-1) as HTMLInputElement;
  lastInput.focus();
}

/**
 * Finds the index of the first empty input element within the list of HTMLInputElement textInputs with data-id attribute set to 'ingredient-input'.
 *
 * @return {number} The index of the first empty input element, or -1 if none are found.
 */
function findEmptyInputIdx() {
  const textInputs: HTMLInputElement[] = Array.from(
    document.querySelectorAll("input[data-id='ingredient-input']"),
  );
  return textInputs.findIndex((input) => input.value === "");
}

export default function FreeTextSearchInput({
  value,
  index,
  listLength,
  handleTextSearchChange,
  handleTextSearchAdd,
  handleTextSearchRemove,
  isInFilter,
}: FreeTextSearchInputProps) {
  return (
    <div className="flex gap-2">
      <div className="max-w-64 grow">
        <input
          type="text"
          data-id="ingredient-input"
          className="w-full rounded-md px-2 py-1 text-black"
          placeholder="Freitext Zutat"
          value={value}
          onChange={(e) => handleTextSearchChange(e, index)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();

              if (isInFilter) {
                // this branch is used when coming from filter
                // Check if there is an empty input
                const emptyInputIdx = findEmptyInputIdx(); // is -1 if there is no empty input elem
                if (emptyInputIdx === -1) {
                  //  if no: add new input at end and focus it
                  await handleTextSearchAdd();
                  focusLast();
                } else {
                  //  if yes: focus it
                  const textInputs: HTMLInputElement[] = Array.from(
                    document.querySelectorAll(
                      "input[data-id='ingredient-input']",
                    ),
                  );
                  const nextEmptyElem = textInputs[emptyInputIdx];
                  nextEmptyElem.focus();
                }
              } else {
                // this branch is used when coming from add/edit -> want to insert new input after currently active input
                await handleTextSearchAdd();
                focusNext();
              }
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
          <CirclePlus onClick={() => handleTextSearchAdd()} />
        )}
      </div>
    </div>
  );
}
