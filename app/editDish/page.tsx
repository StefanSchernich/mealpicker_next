"use client";
import axios from "axios";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import FreeTextSearchInput from "@/components/molecules/FreeTextSearchInput";
import RadioFilterSection from "@/components/molecules/RadioFilterSection";
import SubmitBtn from "@/components/atoms/SubmitBtn";
import Notification from "@/components/atoms/Notification";
import { categoryOptions, caloryOptions, difficultyOptions } from "@/data/data";
import { editDishInDb } from "@/actions/actions";
import {
  trimFreetextSearchTerms,
  handleIngredientAdd,
} from "@/utils/dishProperties";
import { getSignedRequest, uploadFile } from "@/utils/aws";
import { useEffect, useRef, useState, useTransition } from "react";

export default function EditDishPage({
  searchParams,
}: {
  searchParams: {
    id: string;
    title: string;
    imgUrl?: string;
    category: string;
    calories: string;
    difficulty: string;
    ingredients?: string | string[];
  };
}) {
  const {
    id,
    title: qryTitle,
    imgUrl: qryImgUrl,
    category: qryCategory,
    calories: qryCalories,
    difficulty: qryDifficulty,
    ingredients: qryIngredients,
  } = searchParams;

  // #region States, Refs
  const [title, setTitle] = useState(qryTitle);
  const [category, setCategory] = useState(qryCategory);
  const [calories, setCalories] = useState(qryCalories);
  const [difficulty, setDifficulty] = useState(qryDifficulty);
  const [ingredients, setIngredients] = useState<string[]>(
    qryIngredients && Array.isArray(qryIngredients) ? qryIngredients : [""], // if there is only one ingredient in the query string, qryIngrediensts is a string, so convert it to an array so ingredients.map(...) works
  );
  const [previewVisible, setPreviewVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState(qryImgUrl ? qryImgUrl : "");
  const [editOutcome, setEditOutcome] = useState("");

  const notificationRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }
  function handleDishImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const imgFile = e.target.files ? e.target.files[0] : null;
    // convert File to object URL as input for "src" in the preview Image component; update state
    const imgSrc = imgFile ? URL.createObjectURL(imgFile) : "";
    setImgSrc(imgSrc);
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

  // #region Submit Handler
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // default: refresh of entire page

    startTransition(async () => {
      // 1: If image was uploaded in input, upload it to AWS S3 and get the URL of the uploaded image in AWS
      let imgUrl = "";

      // 1a: re-convert imgSrc (= the objectURL) to (image) File and compress ist
      if (imgSrc) {
        const imgFromObjectURL = (
          await axios.get(imgSrc, { responseType: "blob" })
        ).data as File;

        // Compress the file before uploading it to AWS S3
        const compressedImg: File = await imageCompression(imgFromObjectURL, {
          maxSizeMB: 0.15,
        });

        try {
          // 1b: Get signedRequest and URL of uploaded image from AWS
          const {
            data: { signedRequest, uploadedImgUrlInAWS },
          }: { data: { signedRequest: string; uploadedImgUrlInAWS: string } } =
            await getSignedRequest(compressedImg);
          imgUrl = uploadedImgUrlInAWS;
          // 1c: Upload the image file to the signedRequest URL provided by AWS
          await uploadFile(compressedImg, signedRequest);
        } catch (error: any) {
          console.error(
            "There has been an error trying to upload the image:",
            error.message,
          );
        }
      }

      // 2: The image is uploaded to AWS now and the URL of the uploaded image is in "url" --> prepare the data to be sent to the server
      const formData = new FormData();
      const sanitizedIngredients = trimFreetextSearchTerms(ingredients);

      // 2a: only append non-falsy values and non-empty array; none of the following should be null, however, since they are all required inputs
      formData.append("id", id);
      title && formData.append("title", title);
      imgUrl && formData.append("imgUrl", imgUrl);
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

      // 3: Invoke the server action with the finalized form data. The action updates the dish in the db
      try {
        const result = await editDishInDb(formData); // result is id of editedDish if edit was successful, or error message if not
        if ("_id" in result) {
          const { _id: id } = result;
          setEditOutcome("success");
        }
        if ("error" in result) {
          setEditOutcome("fail");
        }
      } catch (error: any) {
        // this fires if the server action itself (not the interaction with the db) throws an error
        console.error("Server action failed:", error.message);
      }
    });
  }
  // #region Effects
  // Einblenden von Preview nur, wenn ein Bild vorhanden ist
  useEffect(() => {
    if (imgSrc) {
      setPreviewVisible(true);
    }
  }, [imgSrc]);

  // scroll to Notification component after adding
  useEffect(() => {
    if (editOutcome) {
      notificationRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [editOutcome]);

  // #region return
  return (
    <>
      <h1 className="mt-2 text-2xl font-bold">Gericht editieren</h1>
      <form className="mt-6 flex flex-col gap-8" onSubmit={handleSubmit}>
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
          <label className="min-w-12" htmlFor="dishImage">
            Bild
          </label>
          <input
            className="file:mr-4 file:rounded-full file:border-0
          file:bg-gray-100 file:px-4
          file:py-2 file:text-sm
          file:font-semibold file:text-black
          hover:file:bg-gray-200"
            type="file"
            id="dishImage"
            onChange={handleDishImgChange}
            accept="image/*"
          ></input>
        </div>

        {previewVisible && (
          <div className="flex items-center gap-4">
            <label className="min-w-12" htmlFor="dishImagePreview">
              Preview
            </label>
            <div className="relative min-h-32 grow">
              <Image
                src={imgSrc}
                alt="Preview of dish"
                id="dishImagePreview"
                fill
                className="object-cover"
              />
            </div>
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
              handleTextSearchAdd={() =>
                handleIngredientAdd(setIngredients, index)
              }
              handleTextSearchRemove={handleIngredientRemove}
              handleTextSearchChange={handleIngredientChange}
              value={ingredient}
            />
          ))}
        </div>
        <SubmitBtn isPending={isPending} actionVerb="Aktualisieren" />
      </form>
      {editOutcome === "success" && (
        <Notification ref={notificationRef} type="success">
          Gericht erfolgreich editiert.
        </Notification>
      )}
      {editOutcome === "fail" && (
        <Notification ref={notificationRef} type="fail">
          Fehler beim Hinzufügen.
        </Notification>
      )}
    </>
  );
}
// TODO: Make sure the old picture is deleted from AWS S3 when the new one is uploaded
