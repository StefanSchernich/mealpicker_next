import { Dish } from "@/types/types";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChefHat, Heart, Pencil, Trash2 } from "lucide-react";
import { getLikedDishesFromSessionStorage, toggleLike } from "@/utils/favs";
import Link from "next/link";
import { categoryOptions, caloryOptions, difficultyOptions } from "@/data/data";
import { getIcon } from "@/utils/display";
import { deleteDishFromDb, deleteImgFromAWS } from "@/actions/actions";
import { usePathname, useRouter } from "next/navigation";

type DishCardProps = {
  retrievedDish: Dish;
  isImageLoaded: boolean;
  setRetrievedDish?: (dish: Dish | null) => void;
  setIsImageLoaded?: React.Dispatch<React.SetStateAction<boolean>>;
  setDeleteOutcome?: React.Dispatch<React.SetStateAction<string>>;
};
export default function DishCard({
  retrievedDish,
  isImageLoaded,
  setRetrievedDish,
  setIsImageLoaded,
  setDeleteOutcome,
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
  const pathname = usePathname();
  const router = useRouter();

  // #region Effects
  useEffect(() => {
    recipeCardRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [retrievedDish]);

  useEffect(() => {
    // On initial render: Check if the dish is already liked
    setIsLiked(
      getLikedDishesFromSessionStorage("likedDishes").some(
        (favDish) => favDish._id === retrievedDish._id,
      ),
    );

    // Update state when recipe is (un-)liked
    window.addEventListener("storage", () => {
      setIsLiked(
        getLikedDishesFromSessionStorage("likedDishes").some(
          (favDish) => favDish._id === retrievedDish._id,
        ),
      );
    });

    return () => {
      window.removeEventListener("storage", () =>
        setIsLiked(
          getLikedDishesFromSessionStorage("likedDishes").some(
            (favDish) => favDish._id === retrievedDish._id,
          ),
        ),
      );
    };
  }, [retrievedDish]);

  // #region return
  return (
    <div
      ref={recipeCardRef}
      className="container mt-12 max-w-[450px] scroll-mt-12 space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Heart
          className="min-h-8 min-w-8"
          color="red"
          fill={`${isLiked ? "red" : "none"}`}
          onClick={() => toggleLike(retrievedDish)}
          cursor={"pointer"}
        />
      </div>
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
            onLoad={() => {
              if (setIsImageLoaded) setIsImageLoaded(true);
            }}
          />
        </div>
      )}
      <div className="flex justify-center gap-12 *:text-2xl">
        <p>{getIcon(category, categoryOptions)}</p>
        <p>{getIcon(calories, caloryOptions)}</p>
        <p>{getIcon(difficulty, difficultyOptions)}</p>
      </div>
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
          <ChefHat color="white" />
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
          <Pencil color="white" />
        </Link>
        <Link
          className="inline-block rounded-full bg-gray-600 px-6 py-2 text-black hover:bg-gray-400"
          href={`/deleteDish/${id}`}
          onClick={async (e) => {
            e.preventDefault();
            if (window.confirm("Möchtest du dieses Rezept wirklich löschen?")) {
              try {
                imgUrl && (await deleteImgFromAWS(imgUrl));
                await deleteDishFromDb(id);
                // If DishCard is shown on index page, hide dish card after deleting
                if (pathname === "/") {
                  setRetrievedDish && setRetrievedDish(null);
                  setDeleteOutcome && setDeleteOutcome("success");
                } else if (pathname === "/favs") {
                  // if coming from favs page, delete the dish from favs in sessionStorage and refresh the page to show updated list w/o the just deleted dish
                  toggleLike(retrievedDish);
                  router.refresh();
                }
              } catch (error) {
                console.error(error);
                if (pathname === "/") {
                  setDeleteOutcome && setDeleteOutcome("fail");
                }
              }
            }
          }}
        >
          <Trash2 color="white" />
        </Link>
      </div>
    </div>
  );
}

// TODO: add feedback for user if there is an error when deleting dish coming from favs page (error on index page is already handled)
