import mongoose, { Schema } from "mongoose";

const ListSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    genre: { type: String, required: true },
    items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
  },
  { timestamps: true }
);

const List = mongoose.model("List", ListSchema);
export default List;
