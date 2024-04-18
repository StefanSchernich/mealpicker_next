"use client";
import Notification from "@/components/atoms/Notification";
import Filter from "@/components/organisms/Filter";
import DishCard from "@/components/organisms/DishCard";
import { useEffect, useRef, useState } from "react";
import { getLikedDishesFromSessionStorage } from "@/utils/utils";
import { Heart } from "lucide-react";
import Link from "next/link";
import type { Dish } from "@/types/types";

export default function IndexPage() {
  // #region States, Refs
  const [category, setCategory] = useState("");
  const [calories, setCalories] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [ingrFilterVisible, setIngrFilterVisible] = useState(false);
  const [ingSearchTerms, setIngSearchTerms] = useState([""]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [retrievedDish, setRetrievedDish] = useState<Dish | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [noDishWithGivenFilter, setNoDishWithGivenFilter] = useState(false);
  const [numberOfLikedDishes, setNumberOfLikedDishes] = useState(0);

  const noDishFoundComponentRef = useRef<HTMLDivElement>(null);

  // #region Handlers
  function handleCategoryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCategory(e.target.value);
  }
  function handleCaloriesChange(e: {
    target: { value: React.SetStateAction<string> };
  }) {
    setCalories(e.target.value);
  }
  function handleDifficultyChange(e: {
    target: { value: React.SetStateAction<string> };
  }) {
    setDifficulty(e.target.value);
  }

  function handleIngredientChange({
    target: { value },
  }: {
    target: { value: string };
  }): void {
    setIngredients((prevState) => {
      // handle ingredient change --> if ingredient not in array -> include it, otherwise remove it (= toggle ingredient)
      return !prevState.includes(value)
        ? [...prevState, value]
        : prevState.filter((ingredient) => ingredient !== value);
    });
  }

  // ##### Freetext Ingredient Input Handlers #####
  function handleTextSearchChange(
    { target: { value } }: { target: { value: string } },
    index: number,
  ) {
    setIngSearchTerms((prevSearchTerms) => {
      const newSearchTerms = [...prevSearchTerms];
      newSearchTerms[index] = value;
      return newSearchTerms;
    });
  }

  /**
   * Handles the addition of a new search term to the ingredient search terms array.
   *
   * This function adds a new empty string to the `ingSearchTerms` array at the specified index. If no index is provided,
   * the new search term is appended to the end of the array.
   *
   * @param {number | undefined} [index] - The index at which to insert the new search term.
   * @return {void} This function does not return a value.
   */
  function handleTextSearchAdd(index?: number) {
    if (index === undefined) {
      setIngSearchTerms((prevState) => [...prevState, ""]);
    } else {
      setIngSearchTerms((prevState) => {
        const newSearchTerms = [...prevState];
        newSearchTerms.splice(index + 1, 0, "");
        return newSearchTerms;
      });
    }
  }

  function handleTextSearchRemove(
    e: { preventDefault: () => void },
    index: number,
  ) {
    e.preventDefault(); // ALL buttons in forms are by default submit buttons --> submit needs to be prevented
    setIngSearchTerms((prevSearchTerms) => {
      const newSearchTerms = [...prevSearchTerms];
      newSearchTerms.splice(index, 1);
      return newSearchTerms;
    });
  }

  function handleIngFilterVisibility(e: { preventDefault: () => void }) {
    e.preventDefault();
    setIngrFilterVisible((prevState) => !prevState);
  }

  function handleFilterFormReset(e: { preventDefault: () => void }) {
    e.preventDefault();
    setCategory("");
    setCalories("");
    setDifficulty("");
    setIngredients([]);
    setIngSearchTerms([""]);
  }

  // #region Effects
  useEffect(() => {
    window.addEventListener("storage", () => {
      setNumberOfLikedDishes(
        getLikedDishesFromSessionStorage("likedDishes").length,
      );
    });
    return () => {
      window.removeEventListener("storage", () => {
        setNumberOfLikedDishes(
          getLikedDishesFromSessionStorage("likedDishes").length,
        );
      });
    };
  });

  useEffect(() => {
    setNumberOfLikedDishes(
      getLikedDishesFromSessionStorage("likedDishes").length,
    );
  }, []);

  // if no dish is found in DB with given filter, scroll to Notification component
  useEffect(() => {
    if (noDishWithGivenFilter) {
      noDishFoundComponentRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [noDishWithGivenFilter]);
  // #region return
  return (
    <>
      <Filter
        category={category}
        calories={calories}
        difficulty={difficulty}
        ingrFilterVisible={ingrFilterVisible}
        ingSearchTerms={ingSearchTerms} // these are the freetext ingredients
        ingredients={ingredients} // these are the checked ingredients
        retrievedDish={retrievedDish}
        handleCategoryChange={handleCategoryChange}
        handleCaloriesChange={handleCaloriesChange}
        handleDifficultyChange={handleDifficultyChange}
        handleIngredientChange={handleIngredientChange}
        handleTextSearchChange={handleTextSearchChange}
        handleTextSearchAdd={handleTextSearchAdd}
        handleTextSearchRemove={handleTextSearchRemove}
        handleIngFilterVisibility={handleIngFilterVisibility}
        handleFilterFormReset={handleFilterFormReset}
        setRetrievedDish={setRetrievedDish}
        setNoDishWithGivenFilter={setNoDishWithGivenFilter}
        setIsImageLoaded={setIsImageLoaded}
      />

      {retrievedDish && (
        <DishCard
          retrievedDish={retrievedDish}
          isImageLoaded={isImageLoaded}
          setIsImageLoaded={setIsImageLoaded}
          setRetrievedDish={setRetrievedDish}
        />
      )}

      {noDishWithGivenFilter && (
        <Notification ref={noDishFoundComponentRef} type="fail">
          Kein Gericht mit diesen Kriterien gefunden.
        </Notification>
      )}

      <Link
        href="/favs"
        className={`fixed bottom-2 right-2 transition-all ${numberOfLikedDishes > 0 ? "opacity-100" : "translate-x-[200%] opacity-0"}`}
      >
        {/* STYLE: Add animation and change size of heart */}
        <Heart fill="red" color="red" size={48} />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[50%] text-center text-xl">
          {numberOfLikedDishes}
        </span>
      </Link>
    </>
  );
}
