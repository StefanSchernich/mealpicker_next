import { categoryOptions, caloryOptions, difficultyOptions } from "@/data/data";
import { Dish } from "@/types/types";
import {
  getIcon,
  getLikedDishesFromSessionStorage,
  toggleLike,
} from "@/utils/utils";
import { Heart } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function FavsCard({ dish }: { dish: Dish }) {
  // #region State & Effects
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // On initial render: Check if the dish is already liked
    setIsLiked(
      getLikedDishesFromSessionStorage("likedDishes").some(
        (favDish) => favDish._id === dish._id,
      ),
    );

    // Update state when recipe is (un-)liked
    window.addEventListener("storage", () => {
      setIsLiked(
        getLikedDishesFromSessionStorage("likedDishes").some(
          (favDish) => favDish._id === dish._id,
        ),
      );
    });

    return () => {
      window.removeEventListener("storage", () =>
        setIsLiked(
          getLikedDishesFromSessionStorage("likedDishes").some(
            (favDish) => favDish._id === dish._id,
          ),
        ),
      );
    };
  }, [dish]);
  // #region Return
  // TODO: Add modal for viewing details of dish
  return (
    <div className="flex w-full gap-4 py-2">
      <div className="relative min-h-24 min-w-24">
        {dish.imgUrl ? (
          <Image
            src={dish.imgUrl}
            alt={dish.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-700">
            No Image
          </div>
        )}
      </div>
      <div className="flex grow flex-col items-start gap-2">
        <h2 className="text-md">{dish.title}</h2>
        <div className="*:text-md flex w-auto gap-4 rounded-full bg-gray-900 p-2">
          <p>{getIcon(dish.category, categoryOptions)}</p>
          <p>{getIcon(dish.calories, caloryOptions)}</p>
          <p>{getIcon(dish.difficulty, difficultyOptions)}</p>
        </div>
      </div>
      <Heart
        className="min-h-6 min-w-6 self-center"
        color="red"
        fill={`${isLiked ? "red" : "none"}`}
        onClick={() => toggleLike(dish)}
        cursor={"pointer"}
      />
    </div>
  );
}
