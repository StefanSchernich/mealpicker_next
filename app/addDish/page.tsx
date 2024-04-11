"use client";
import { useState, useEffect } from "react";
import FreeTextSearchInput from "@/components/molecules/FreeTextSearchInput";
import { categoryOptions, caloryOptions, difficultyOptions } from "@/data/data";
import RadioFilterSection from "@/components/molecules/RadioFilterSection";
import axios from "axios";
import Image from "next/image";
import { trimFreetextSearchTerms } from "@/utils/utils";
import { addDishToDb } from "@/actions/actions";

export default function AddDish() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [calories, setCalories] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState("");

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }
  function handleMealImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const imgFile = e.target.files ? e.target.files[0] : null;
    getSignedRequest(imgFile);

    function getSignedRequest(file: globalThis.File | null) {
      if (!file) throw new Error("Keine Datei ausgewählt");
      axios
        .get(`/sign-s3?file-name=${file.name}&file-type=${file.type}`)
        .then((res) => {
          uploadFile(file, res.data.signedRequest, res.data.url);
        })
        .catch((err) => console.error("Could not get signed URL."));

      /**
       * Uploads the image file to the URL signed by AWS.
       *
       * @param {globalThis.File} file - image file to be uploaded
       * @param {string} signedRequest - the signed URL for the file upload
       * @param {string} url - the URL of the uploaded file
       */
      function uploadFile(
        file: globalThis.File,
        signedRequest: string,
        url: string,
      ) {
        axios
          .put(signedRequest, file) // signedRequest is an AWS S3 URL with embedded credentials
          .then(() => {
            setImgSrc(url);
          })
          .catch((err) => console.error("Could not upload file. " + err));
      }
    }
  }
  function handleCategoryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCategory(e.target.value);
  }
  function handleCaloriesChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCalories(e.target.value);
  }
  function handleDifficultyChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDifficulty(e.target.value);
  }
  function handleIngredientAdd() {
    setIngredients((prevState) => [...prevState, ""]);
  }
  function handleIngredientRemove(
    e: React.MouseEvent<SVGSVGElement>,
    index: number,
  ) {
    e.preventDefault(); // ALL buttons in forms are by default submit buttons --> submit needs to be prevented
    setIngredients((prevState) => {
      const newIngredientsList = [...prevState];
      newIngredientsList.splice(index, 1);
      return newIngredientsList;
    });
  }
  function handleIngredientChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) {
    setIngredients((prevState) => {
      const newIngredientsList = [...prevState];
      newIngredientsList[index] = e.target.value;
      return newIngredientsList;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // default: refresh of entire page

    const sanitizedIngredients = trimFreetextSearchTerms(ingredients);

    const formData = new FormData();

    // only append non-falsy values and non-empty array; none of the following should be null, however, since they are all required inputs
    title && formData.append("title", title);
    imgSrc && formData.append("imgUrl", imgSrc);
    category && formData.append("category", category);
    calories && formData.append("calories", calories);
    difficulty && formData.append("difficulty", difficulty);

    // FormData does NOT allow arrays as values
    // --> add each string separately under same key (which is allowed; array can be recovered by formData.getAll method) if there are any ingredients
    if (sanitizedIngredients.length > 0) {
      sanitizedIngredients.forEach((ingredient) => {
        formData.append("ingredients", ingredient);
      });
    }
    console.log(formData);
    const newDish = await addDishToDb(formData);
    console.log(newDish);
  }

  // Einblenden von Preview nur, wenn ein Bild vorhanden ist
  useEffect(() => {
    if (imgSrc) {
      setPreviewVisible(true);
    }
  }, [imgSrc]);

  return (
    <>
      <h1 className="mt-6 text-2xl font-bold">Neues Gericht</h1>
      <form
        className="flex flex-col gap-8"
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          // Enter soll neue Input-Zeile erzeugen, nicht Formular submitten
          if (e.key === "Enter") {
            e.preventDefault();
            return false;
          }
        }}
      >
        <div className="flex items-center gap-4">
          <label className="min-w-12" htmlFor="title">
            Titel
          </label>
          <input
            type="text"
            placeholder="Gericht"
            className="px-2 py-1 text-black"
            id="title"
            name="title"
            value={title}
            onChange={handleTitleChange}
            autoFocus
            required
          ></input>
        </div>
        <div className="flex items-center gap-4">
          <label className="min-w-12" htmlFor="mealImage">
            Bild
          </label>
          <input
            type="file"
            id="mealImage"
            onChange={handleMealImgChange}
            accept="image/*"
          ></input>
        </div>

        {previewVisible && (
          <div className="inline-block">
            <label className="min-w-12" htmlFor="mealImagePreview">
              Preview
            </label>
            <Image src={imgSrc} alt="Preview of dish" id="mealImagePreview" />
          </div>
        )}
        {
          //#region Radio-Filter
        }
        <fieldset className="flex flex-col justify-center gap-8">
          <RadioFilterSection
            sectionName="category"
            state={category}
            dataArr={categoryOptions}
            changeHandler={handleCategoryChange}
            isRequired={true}
          >
            Kategorie
          </RadioFilterSection>
          <RadioFilterSection
            sectionName="calories"
            state={calories}
            dataArr={caloryOptions}
            changeHandler={handleCaloriesChange}
            isRequired={true}
          >
            Kalorien
          </RadioFilterSection>
          <RadioFilterSection
            sectionName="difficulty"
            state={difficulty}
            dataArr={difficultyOptions}
            changeHandler={handleDifficultyChange}
            isRequired={true}
          >
            Schwierigkeit
          </RadioFilterSection>
        </fieldset>
        {
          //#region Freitext-Filter
        }
        <div className="flex flex-col gap-3">
          {ingredients.map((ingredient, index) => (
            <FreeTextSearchInput
              key={index}
              index={index}
              listLength={ingredients.length}
              handleTextSearchAdd={handleIngredientAdd}
              handleTextSearchRemove={handleIngredientRemove}
              handleTextSearchChange={handleIngredientChange}
              value={ingredient}
            />
          ))}
        </div>
        <input
          type="submit"
          className="grow cursor-pointer rounded-3xl border-2 bg-slate-100 px-4 py-2 text-black"
          value="Hochladen"
        />
      </form>
    </>
  );
}
