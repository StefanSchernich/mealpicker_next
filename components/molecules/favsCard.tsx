import type { Dish } from "@/types/types";
import { categoryOptions, caloryOptions, difficultyOptions } from "@/data/data";
import { getLikedDishesFromSessionStorage, toggleLike } from "@/utils/favs";
import { getIcon } from "@/utils/display";
import { Heart } from "lucide-react";
import DishCard from "../organisms/DishCard";
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function FavsCard({ dish }: { dish: Dish }) {
  // #region State & Effects
  const [isLiked, setIsLiked] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
  return (
    <>
      <div className="flex w-full gap-4 py-2">
        <div className="relative min-h-24 min-w-24">
          {dish.imgUrl ? (
            <Image
              src={dish.imgUrl}
              alt={dish.title}
              fill
              className="object-cover"
              onClick={onOpen}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center rounded-md bg-gray-700"
              onClick={onOpen}
            >
              No Image
            </div>
          )}
        </div>
        <div className="flex grow flex-col items-start gap-2" onClick={onOpen}>
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
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent className="bg-gray-950">
          {(onClose) => (
            <>
              <ModalBody>
                <DishCard retrievedDish={dish} isImageLoaded={true} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
