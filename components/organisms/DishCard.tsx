import { RetrievedDish } from "@/app/page";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { getArrayFromSessionStorage, toggleDish } from "@/utils/utils";
import Link from "next/link";
import { categoryOptions, caloryOptions, difficultyOptions } from "@/data/data";
import { getIcon } from "@/utils/utils";
import { deleteDishFromDb } from "@/actions/actions";

type DishCardProps = {
  retrievedDish: RetrievedDish;
  isImageLoaded: boolean;
  setRetrievedDish: (dish: RetrievedDish | null) => void;
  setIsImageLoaded: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function DishCard({
  retrievedDish,
  isImageLoaded,
  setRetrievedDish,
  setIsImageLoaded,
}: DishCardProps) {
  // Create ref to scroll to once Recipe is loaded
  const recipeCardRef = useRef<HTMLDivElement>(null);
  const {
    _id: id,
    title,
    imgUrl,
    category,
    calories,
    difficulty,
    ingredients,
  } = retrievedDish;

  const [isLiked, setIsLiked] = useState<boolean>(false);

  // #region Effects
  useEffect(() => {
    recipeCardRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [retrievedDish]);

  useEffect(() => {
    // On initial render: Check if the dish is already liked
    setIsLiked(getArrayFromSessionStorage("likedDishes").includes(id));

    // Update state when recipe is (un-)liked
    window.addEventListener("storage", () => {
      setIsLiked(getArrayFromSessionStorage("likedDishes").includes(id));
    });

    return () => {
      window.removeEventListener("storage", () =>
        setIsLiked(getArrayFromSessionStorage("likedDishes").includes(id)),
      );
    };
  }, [id]);

  /**
   * Function to toggle the like status of a dish in sessionStorage
   *
   * @param {string} id - the id of the dish to toggle like status
   * @return {void}
   */
  function toggleLike(id: string) {
    const likedDishes = getArrayFromSessionStorage("likedDishes");
    const updatedDishes = toggleDish(likedDishes, id);
    sessionStorage.setItem("likedDishes", JSON.stringify(updatedDishes));
    window.dispatchEvent(new Event("storage")); // manually fire "storage" event, because by default storage event is only fired when *another* tab changes storage
  }
  // #region return
  return (
    <div
      ref={recipeCardRef}
      className="container mt-12 max-w-[500px] space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Heart
          className="min-h-8 min-w-8"
          color="red"
          fill={`${isLiked ? "red" : "none"}`}
          onClick={() => toggleLike(id)}
          cursor={"pointer"}
        />
      </div>
      {imgUrl && (
        <div
          className={`relative h-auto min-h-60 w-full max-w-96 overflow-hidden rounded-3xl
          ${isImageLoaded ? "animate-none bg-none" : "animate-pulse bg-slate-400"}`}
        >
          {/* TODO: add "sizes" to all Image components in the App (DishCard, Add/Edit Dish Page...) to improve performance */}
          <Image
            src={imgUrl}
            alt={title}
            fill
            style={{ objectFit: "contain" }}
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
      )}
      <div className="flex justify-center gap-12 *:text-2xl">
        <p>{getIcon(category, categoryOptions)}</p>
        <p>{getIcon(calories, caloryOptions)}</p>
        <p>{getIcon(difficulty, difficultyOptions)}</p>
      </div>
      {/* STYLE: Replace ingredient list items with Badges (as on Tailwind Homepage)? */}
      <ul className="flex flex-wrap gap-2 *:inline *:rounded-full *:bg-gray-900 *:px-3 *:py-1 *:text-white">
        {ingredients?.map((ingredient, index) => (
          <li key={`ingredient-${index}`}>{ingredient}</li>
        ))}
      </ul>
      {
        //#region Buttons
      }
      <div className="flex justify-center gap-4">
        <Link
          className="inline-block rounded-full bg-gray-600 px-6 py-2 text-black hover:bg-gray-400"
          href={`https://www.chefkoch.de/rs/s0/${title}/Rezepte.html`}
        >
          🔎
        </Link>
        <Link
          className="inline-block rounded-full bg-gray-600 px-6 py-2 text-black hover:bg-gray-400"
          href={{
            pathname: `/editDish/`,
            query: {
              id,
              title,
              imgUrl,
              category,
              calories,
              difficulty,
              ingredients,
            },
          }}
        >
          ✏️
        </Link>
        <Link
          className="inline-block rounded-full bg-gray-600 px-6 py-2 text-black hover:bg-gray-400"
          href={`/deleteDish/${id}`}
          onClick={(e) => {
            e.preventDefault();
            if (window.confirm("Möchtest du dieses Rezept wirklich löschen?"))
              deleteDishFromDb(id);
            setRetrievedDish(null); // Hide dish card after deleting
          }}
        ></Link>
      </div>
    </div>
  );
}
