"use client";
import React, { useEffect, useState } from "react";
import FavsCard from "@/components/molecules/favsCard";
import { getLikedDishesFromSessionStorage } from "@/utils/favs";
import type { Dish } from "@/types/types";
import { CircleArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Favs() {
  const [likedDishes, setLikedDishes] = useState<Dish[]>([]);

  useEffect(() => {
    const likedDishesInSessionStorage =
      getLikedDishesFromSessionStorage("likedDishes");
    setLikedDishes(likedDishesInSessionStorage);
  }, []);
  return (
    <>
      <div className="flex max-w-[450px] items-center justify-between">
        <h1 className="text-xl font-bold">Favs</h1>
        <Link href="/">
          <CircleArrowLeft />
        </Link>
      </div>
      {likedDishes.length === 0 ? (
        <p>Keine Favs abgespeichert.</p>
      ) : (
        <ul className="mt-4 flex max-w-[450px] flex-col divide-y divide-gray-800">
          {likedDishes.map((dish) => (
            <li key={dish._id}>
              <FavsCard dish={dish} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
