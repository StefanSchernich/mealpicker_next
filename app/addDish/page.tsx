"use client";
import { useState, useEffect, useRef } from "react";
import { categoryOptions, caloryOptions, difficultyOptions } from "@/data/data";
import Notification from "@/components/atoms/Notification";
import FreeTextSearchInput from "@/components/molecules/FreeTextSearchInput";
import RadioFilterSection from "@/components/molecules/RadioFilterSection";
import axios from "axios";
import Image from "next/image";
import { trimFreetextSearchTerms } from "@/utils/utils";
import { addDishToDb } from "@/actions/actions";
import imageCompression from "browser-image-compression";

export default function AddDish() {
  // #region States, Refs and Effects
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [calories, setCalories] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [uploadOutcome, setUploadOutcome] = useState("");

  const notificationRef = useRef<HTMLDivElement>(null);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }
  function handleMealImgChange(e: React.ChangeEvent<HTMLInputElement>) {
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

  // #region Submit Handler
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // default: refresh of entire page

    // 1: If image was uploaded in input, upload it to AWS S3 and get the URL of the uploaded image in AWS
    // 1a: re-convert imgSrc (= the objectURL) to (image) File
    let imgUrl = "";

    if (imgSrc) {
      const imgFromObjectURL = (
        await axios.get(imgSrc, { responseType: "blob" })
      ).data as File;

      // Compress the file before uploading it to AWS S3
      const compressedImg: File = await imageCompression(imgFromObjectURL, {
        maxSizeMB: 0.15,
      });

      // TODO: Check, if this can be replaced with server action alone (i.e. w/o any API call)
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

    // 3: Invoke the server action with the finalized form data. The action adds recipe to db
    try {
      const result = await addDishToDb(formData); // result is id of newDish if successfully added to db, or error message if not
      if ("_id" in result) {
        const { _id: id } = result;
        setUploadOutcome("success");
        resetDishStates();
      }
      if ("error" in result) {
        setUploadOutcome("fail");
      }
      // TODO: Do something with the id and handle the error... like display the message "Erfolgreich hinzugefügt, jetzt ansehen?" und scrolle zur Message mit scrollIntoView
      resetDishStates();
    } catch (error: any) {
      // this fires if the server action itself (not the interaction with the db) throws an error
      console.error("Server action failed:", error.message);
    }
  }
  // #endregion

  function resetDishStates() {
    setTitle("");
    setCategory("");
    setCalories("");
    setDifficulty("");
    setIngredients([""]);
    setPreviewVisible(false);
    setImgSrc("");
  }

  // Helper Function for Submitting / File Upload to AWS S3
  /**
   * Retrieves a signed request from the server for uploading a file to AWS S3.
   *
   * @param {globalThis.File | null} file - The file to be uploaded
   * @return {AxiosResponse} The response containing a "data" object, which contains the signedRequest (= URL with embedded credentials) for the file upload and the URL of the uploaded file in AWS S3
   */
  async function getSignedRequest(file: globalThis.File | null) {
    if (!file) throw new Error("Keine Datei ausgewählt");
    const response = await axios.get(
      `api/sign-s3?file-name=${file.name}&file-type=${file.type}`,
    );
    return response;
  }

  /**
   * Uploads the image file to the URL signed by AWS.
   *
   * @param {globalThis.File} file - image file to be uploaded
   * @param {string} signedRequest - the signed URL for the file upload
   * @param {string} url - the URL of the uploaded file
   */
  async function uploadFile(
    file: globalThis.File,
    signedRequest: string,
  ): Promise<void> {
    await axios.put(signedRequest, file); // signedRequest is an AWS S3 URL with embedded credentials
  }

  // Einblenden von Preview nur, wenn ein Bild vorhanden ist
  useEffect(() => {
    if (imgSrc) {
      setPreviewVisible(true);
    }
  }, [imgSrc]);

  // scroll to Notification component after adding
  useEffect(() => {
    if (uploadOutcome) {
      notificationRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [uploadOutcome]);

  // #region Start of 'return'
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
          <label className="min-w-12" htmlFor="dishImage">
            Bild
          </label>
          <input
            type="file"
            id="dishImage"
            onChange={handleMealImgChange}
            accept="image/*"
          ></input>
        </div>

        {previewVisible && (
          <div className="inline-block">
            <label className="min-w-12" htmlFor="mealImagePreview">
              Preview
            </label>
            <Image
              src={imgSrc}
              width={200}
              height={200}
              alt="Preview of dish"
              id="mealImagePreview"
            />
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
        {/* TODO: useFormStatus hook nutzen, um "pending" anzeigen zu können --> Input Komponente extrahieren  */}
        <input
          type="submit"
          className="grow cursor-pointer rounded-3xl border-2 bg-slate-100 px-4 py-2 text-black"
          value="Hochladen"
        />
      </form>

      {uploadOutcome === "success" && (
        <Notification ref={notificationRef} type="success">
          Gericht erfolgreich hinzugefügt.
        </Notification>
      )}
      {uploadOutcome === "fail" && (
        <Notification ref={notificationRef} type="fail">
          Fehler beim Hinzufügen.
        </Notification>
      )}
    </>
  );
}
