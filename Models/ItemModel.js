import mongoose from "mongoose";

const itemSchema = mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    img: { type: String, required: true, default: "https://www.aaronfaber.com/wp-content/uploads/2017/03/product-placeholder-wp.jpg" },
    imgTitle: {type: String, required: true},
    imgThumb: {type: String, required: true},
    imgVertical: {type: String, required: true},
    trailer: {type: String, required: true},
    movie: {type: String, required: true},
    duration: {type: String, required: true},
    year: {type: String, required: true},
    limit: {type: String, required: true},
    genre: {type: String, required: true},
    isSeries: {type: Boolean, required: true},
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields to the schema automatically
  }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
