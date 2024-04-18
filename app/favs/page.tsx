"use client";
import React, { useEffect, useState } from "react";
import { getLikedDishesFromSessionStorage } from "@/utils/utils";
import { Dish } from "@/types/types";

export default function Favs() {
  const [likedDishes, setLikedDishes] = useState<Dish[]>([]);

  useEffect(() => {
    const likedDishesInSessionStorage =
      getLikedDishesFromSessionStorage("likedDishes");
    setLikedDishes(likedDishesInSessionStorage);
  }, []);
  return (
    //TODO: Add header (back, Title) to favsCard
    //TODO: Add image & icons to favsCard
    //STYLE: Style favsCard
    <>
      <h1>Liked dishes</h1>
      {likedDishes.length === 0 ? (
        <p>No liked dishes found.</p>
      ) : (
        <ul>
          {likedDishes.map((dish) => (
            <li key={dish._id}>
              <h2>{dish.title}</h2>
              <p>{dish.category}</p>
              <p>{dish.calories}</p>
              <p>{dish.difficulty}</p>
              <p>{dish.imgUrl}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
