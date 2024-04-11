import mongoose from "mongoose";
import aws from "aws-sdk";
aws.config.region = "eu-central-1";

export async function connectToDb() {
  mongoose
    .connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.87bkb.mongodb.net/RecipeDB?retryWrites=true&w=majority`,
    )
    .then(() => console.log("Successfully connected to DB"))
    .catch((err) => console.error(err));
}

const recipesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imgUrl: { type: String },
  category: {
    type: String,
    required: true,
    enum: ["Fleisch", "Fisch", "Vegetarisch"],
  },
  calories: { type: String, required: true, enum: ["Normal", "Diät"] },
  difficulty: {
    type: String,
    required: true,
    enum: ["Einfach", "Mittel", "Schwer"],
  },
  ingredients: [String],
});

export const Recipe =
  mongoose.models.recipe || mongoose.model("recipe", recipesSchema);
