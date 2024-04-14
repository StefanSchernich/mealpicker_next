"use client";
import Notification from "@/components/atoms/Notification";
import Filter from "@/components/organisms/Filter";
import DishCard from "@/components/organisms/DishCard";
import { useEffect, useRef, useState } from "react";
import { getArrayFromSessionStorage } from "@/utils/utils";
import { Heart } from "lucide-react";
import Link from "next/link";

export type RetrievedDish = {
  _id: string;
  title: string;
  imgUrl?: string;
  category: string;
  calories: string;
  difficulty: string;
  ingredients?: string[];
};

export default function IndexPage() {
  // #region States, Refs
  const [category, setCategory] = useState("");
  const [calories, setCalories] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [ingrFilterVisible, setIngrFilterVisible] = useState(false);
  const [ingSearchTerms, setIngSearchTerms] = useState([""]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [retrievedDish, setRetrievedDish] = useState<RetrievedDish | null>(
    null,
  );
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

  function handleTextSearchAdd() {
    setIngSearchTerms((prevState) => [...prevState, ""]);
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
      setNumberOfLikedDishes(getArrayFromSessionStorage("likedDishes").length);
    });
    return () => {
      window.removeEventListener("storage", () => {
        setNumberOfLikedDishes(
          getArrayFromSessionStorage("likedDishes").length,
        );
      });
    };
  });

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
        />
      )}

      {noDishWithGivenFilter && (
        <Notification ref={noDishFoundComponentRef} type="fail">
          Kein Gericht mit diesen Kriterien gefunden.
        </Notification>
      )}

      {/* TODO: Favs-Seite erstellen */}
      {numberOfLikedDishes > 0 && (
        <Link
          href="/favs"
          className="fixed bottom-3 right-3 min-h-12 min-w-12 text-2xl"
        >
          <Heart fill="red" color="red" size={56} />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] text-center">
            {numberOfLikedDishes}
          </span>
        </Link>
      )}
    </>
  );
}
