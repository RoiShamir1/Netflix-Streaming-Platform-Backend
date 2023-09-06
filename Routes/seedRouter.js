import express from "express";
import User from "../Models/UserModel.js";
import Item from "../Models/ItemModel.js";
import data, { listSeriesNames, listMovieNames, genres } from "../data.js";
import List from "../Models/ListModel.js";
import expressAsyncHandler from "express-async-handler";

const seedRouter = express.Router();

seedRouter.get(
  "/",
  expressAsyncHandler(async (req, res, next) => {
    try {
      await Item.deleteMany({});
      await User.deleteMany({});
      await List.deleteMany({});

      const createdItems = await Item.insertMany(data.items);
      const createdUsers = await User.insertMany(data.users);

      await seedLists(listSeriesNames, "series");
      await seedLists(listMovieNames, "movies");

      const createdLists = await List.insertMany(data.lists);

      res.send({ createdUsers, createdItems, createdLists });
    } catch (error) {
      console.log(error.message);
    }
  })
);

const seedLists = async (array, type) => {
  for (let i = 0; i < array.length; ++i) {
    const isSeries = type === "series" ? true : false;

    const newList = await Item.aggregate([{ $match: { isSeries: isSeries } }, { $sample: { size: 8 } }]);

    newList.map((i) => i._id);

    const newListItems = new List({
      title: array[i],
      type: type,
      genre: genres[i],
      items: newList,
    });
    await newListItems.save();
  }
};

export default seedRouter;
