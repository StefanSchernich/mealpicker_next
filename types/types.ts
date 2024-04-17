// Object used for filtering in db but *before* modifications are made for db query (e.g. adding $all to "ingredients" key)
export type FilterObj = {
  category?: string;
  calories?: string;
  difficulty?: string;
  ingredients?: FormDataEntryValue[];
};

// Object containing the form data of a dish, used for filtering, adding and editing
export type FormDataObj = {
  [k: string]: FormDataEntryValue | FormDataEntryValue[];
};

export type Dish = {
  _id: string;
  title: string;
  imgUrl?: string;
  category: string;
  calories: string;
  difficulty: string;
  ingredients?: string[];
};
