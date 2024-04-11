import { RetrievedRecipe } from "@/app/page";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { getArrayFromSessionStorage, toggleDish } from "@/utils/utils";

type DishCardProps = {
  retrievedDish: RetrievedRecipe;
  isImageLoaded: boolean;
  setIsImageLoaded: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function DishCard({
  retrievedDish: retrievedDish,
  isImageLoaded,
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

  return (
    <div ref={recipeCardRef} className="space-y-8">
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
      <p>{id}</p>
      {imgUrl && (
        <div
          className={`relative h-auto min-h-60 w-full max-w-96 overflow-hidden rounded-3xl
          ${isImageLoaded ? "animate-none bg-none" : "animate-pulse bg-slate-400"}`}
        >
          <Image
            src={imgUrl}
            alt={title}
            fill
            style={{ objectFit: "contain" }}
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
      )}

      <div className="flex gap-12">
        <p>{category}</p>
        <p>{calories}</p>
        <p>{difficulty}</p>
      </div>
      <ul className="list-inside list-disc space-y-2">
        {ingredients?.map((ingredient, index) => (
          <li key={`ingredient-${index}`}>{ingredient}</li>
        ))}
      </ul>
    </div>
  );
}
