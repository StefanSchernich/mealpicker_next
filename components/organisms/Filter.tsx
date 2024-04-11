"use client";

import React, { FormEvent } from "react";
import RadioFilterSection from "@/components/molecules/RadioFilterSection";
import FilterOptionCheckbox from "@/components/atoms/FilterOptionCheckbox";
import {
  categoryOptions,
  caloryOptions,
  difficultyOptions,
  ingredientOptions,
} from "@/data/data";
import FreeTextSearchInput from "@/components/molecules/FreeTextSearchInput";
import { RetrievedRecipe as RetrievedDish } from "@/app/page";
import { trimFreetextSearchTerms } from "@/utils/utils";
import axios from "axios";

type FilterProps = {
  category: string;
  calories: string;
  difficulty: string;
  ingSearchTerms: string[];
  ingredients: string[];
  ingrFilterVisible: boolean;
  retrievedDish: RetrievedDish | null;
  handleCategoryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCaloriesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDifficultyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleIngredientChange: ({
    target: { value },
  }: {
    target: { value: string };
  }) => void;
  handleTextSearchAdd: () => void;
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
  setRetrievedDish: (dish: RetrievedDish | null) => void;
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
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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

    try {
      let currentId: string | undefined;

      // If there is a recipe in state (= it's not the first time the submit button is clicked), get its id
      if (retrievedDish) {
        // here 'retrivedDish' is the former dish before a new one is fetched
        currentId = retrievedDish._id;
      }
      // Make the API call to get a new dish
      const res = await axios.postForm("/api/recipe", formData);
      console.log(res.data);

      // if no dish is found with given filter, change state and show message to user
      if (!res.data) {
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
    // Reset state so that Image Placeholer (= pulsing div) is shown again when recipe changes and image of *new* recipe has to be loaded;
    // otherwise, image of old recipe will be shown and no need to load the placeholder animation

    //TODO: Handle Enter Keypress -> decide whether to submit form or add another freetext search term
    // Event-Listener für "Enter"
    // useEffect(() => {
    //   function handleEnter(e: KeyboardEvent) {
    //     if (e.key === "Enter") {
    //       handleSubmit(e);
    //     }
    //   }

    //   document.addEventListener("keydown", handleEnter);
    //   return () => document.removeEventListener("keydown", handleEnter);
    // });

    // Resette Filter beim Mounting / Rückkehr von Rezeptseiten
    // useEffect(() => {
    //   setCategory("");
    //   setCalories("");
    //   setDifficulty("");
    //   setIngredients([]);
    //   setIngSearchTerms([""]);
    // }, []);
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
          <div className={`${ingrFilterVisible ? "visible" : "hidden"}`}>
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
            <input
              type="submit"
              className="grow cursor-pointer rounded-3xl border-2 bg-slate-100 px-4 py-2 text-black"
              value="Suchen"
            />
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
