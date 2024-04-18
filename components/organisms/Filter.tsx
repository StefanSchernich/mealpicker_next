import React, { FormEvent, useTransition } from "react";
import RadioFilterSection from "@/components/molecules/RadioFilterSection";
import FilterOptionCheckbox from "@/components/atoms/FilterOptionCheckbox";
import {
  categoryOptions,
  caloryOptions,
  difficultyOptions,
  ingredientOptions,
} from "@/data/data";
import FreeTextSearchInput from "@/components/molecules/FreeTextSearchInput";
import { trimFreetextSearchTerms } from "@/utils/utils";
import axios from "axios";
import SubmitBtn from "../atoms/SubmitBtn";
import type { Dish } from "@/types/types";

type FilterProps = {
  category: string;
  calories: string;
  difficulty: string;
  ingSearchTerms: string[];
  ingredients: string[];
  ingrFilterVisible: boolean;
  retrievedDish: Dish | null;
  handleCategoryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCaloriesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDifficultyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleIngredientChange: ({
    target: { value },
  }: {
    target: { value: string };
  }) => void;
  handleTextSearchAdd: (index?: number) => void;
  handleTextSearchChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
  handleTextSearchRemove: (
    e: React.MouseEvent<SVGSVGElement>,
    index: number,
  ) => void;
  handleIngFilterVisibility: (e: { preventDefault: () => void }) => void;
  handleFilterFormReset: (e: { preventDefault: () => void }) => void;
  setRetrievedDish: (dish: Dish | null) => void;
  setNoDishWithGivenFilter: React.Dispatch<React.SetStateAction<boolean>>;
  setIsImageLoaded: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Filter({
  category,
  calories,
  difficulty,
  ingSearchTerms,
  ingredients,
  ingrFilterVisible,
  retrievedDish,
  handleCategoryChange,
  handleCaloriesChange,
  handleDifficultyChange,
  handleIngredientChange,
  handleTextSearchAdd,
  handleTextSearchChange,
  handleTextSearchRemove,
  handleIngFilterVisibility,
  handleFilterFormReset,
  setRetrievedDish,
  setNoDishWithGivenFilter,
  setIsImageLoaded,
}: FilterProps) {
  const [isPending, startTransition] = useTransition();

  // #region Submit Handler
  const handleSubmit = (e: FormEvent) => {
    // TODO: Check, if this can be replaced with server action alone (i.e. w/o any API call)
    e.preventDefault();
    // clear previous dish (so that loading animation of new dish can be shown)
    setRetrievedDish(null);

    const formData = new FormData();
    // only append non-falsy values and non-empty array
    category && formData.append("category", category);
    calories && formData.append("calories", calories);
    difficulty && formData.append("difficulty", difficulty);

    // combine checked and freetext ingredients in one array
    let checkedAndTextIngredients = [
      ...ingredients,
      ...trimFreetextSearchTerms(ingSearchTerms),
    ];

    // FormData does NOT allow arrays as values
    // --> add each string separately under same key (which is allowed; array can be recovered by formData.getAll method) if there are any ingredients
    if (checkedAndTextIngredients.length > 0) {
      checkedAndTextIngredients.forEach((ingredient) => {
        formData.append("ingredients", ingredient);
      });
    }

    let currentId: string | undefined;

    // If there is a recipe in state (= it's not the first time the submit button is clicked), get its id for now to compare it to the new one later
    if (retrievedDish) {
      // here 'retrivedDish' is the former dish before a new one is fetched
      currentId = retrievedDish._id;
    }

    startTransition(async () => {
      try {
        // Make the API call to get a new dish
        const res = await axios.postForm("/api/fetchRandomRecipe", formData);

        // if no dish is found with given filter, change state and show message to user
        if (res.data.message === "No dish found with given filter") {
          setRetrievedDish(null);
          setNoDishWithGivenFilter(true);
          return;
        }

        // if a dish is found, hide the "NoDishFound" Notification
        setNoDishWithGivenFilter(false);

        const newDish = res.data;
        const newDishId = newDish._id;

        // if the new dish is the same as the old one, no changes are necessary --> return
        if (newDishId === currentId) return;

        // else reset ImageLoad state (so that placeholder is shown again until new dish image is fetched) and set the new dish in state
        setIsImageLoaded(false);
        setRetrievedDish(newDish);
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <>
      {
        //#region Kategorie/Kalorinen/Schwierigkeit Filter
      }
      <form onSubmit={handleSubmit}>
        <fieldset className="flex flex-col justify-center gap-8">
          <RadioFilterSection
            sectionName="category"
            state={category}
            dataArr={categoryOptions}
            changeHandler={handleCategoryChange}
            isRequired={false}
          >
            {" "}
            Kategorie
          </RadioFilterSection>
          <RadioFilterSection
            sectionName="calories"
            state={calories}
            dataArr={caloryOptions}
            changeHandler={handleCaloriesChange}
            isRequired={false}
          >
            {" "}
            Kalorien
          </RadioFilterSection>
          <RadioFilterSection
            sectionName="difficulty"
            state={difficulty}
            dataArr={difficultyOptions}
            changeHandler={handleDifficultyChange}
            isRequired={false}
          >
            {" "}
            Schwierigkeit
          </RadioFilterSection>
          <button
            className="rounded-3xl border-2 border-white px-4 py-2"
            id="ingFilterVisibilityBtn"
            onClick={handleIngFilterVisibility}
          >
            {ingrFilterVisible
              ? "Zutatenfilter ausblenden"
              : "Zutatenfilter einblenden"}
          </button>

          {
            //#region Zutatenfilter
          }
          <div
            //  add negative bottom margin to compensate for double gap above/below element with height:0; height is necessary to clear space of collapsed filter; scale is necessary to animate height change properly
            className={`origin-top overflow-hidden transition-all duration-250 ease-linear ${ingrFilterVisible ? "scale-y-1 max-h-[99999px]" : "-mb-8 max-h-0 scale-y-0"}`}
          >
            <h2 className="mb-4 text-center text-xl font-bold">Zutaten</h2>

            {/* ### Checkbox-Zutatenfilter ### */}
            <div className="flex flex-wrap gap-8">
              {ingredientOptions.map(({ id, value, icon }) => {
                return (
                  <FilterOptionCheckbox
                    sectionName="ingredients"
                    key={id}
                    value={value}
                    icon={icon}
                    state={ingredients}
                    changeHandler={handleIngredientChange}
                  />
                );
              })}
            </div>

            {/* ### Freitext-Zutatenfilter ### */}
            <div className="mt-8 flex flex-col gap-3">
              {ingSearchTerms.map((searchTerm, index) => {
                return (
                  <FreeTextSearchInput
                    key={`index_${index}`}
                    index={index}
                    value={searchTerm}
                    listLength={ingSearchTerms.length}
                    handleTextSearchChange={handleTextSearchChange}
                    handleTextSearchAdd={handleTextSearchAdd}
                    handleTextSearchRemove={handleTextSearchRemove}
                  />
                );
              })}
            </div>
          </div>

          {
            //#region Buttons
          }
          <div className="flex gap-4">
            <SubmitBtn isPending={isPending} actionVerb="Suchen" />
            <button
              className="grow rounded-3xl border-2 px-4 py-2"
              onClick={handleFilterFormReset}
            >
              Reset Filter
            </button>
          </div>
        </fieldset>
      </form>
    </>
  );
}
