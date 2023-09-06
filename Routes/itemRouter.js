import express from "express";
import expressAsyncHandler from "express-async-handler";

import Item from "../Models/ItemModel.js";
import { isAuth } from "../utils.js";

const itemRouter = express.Router();
const page_Size = 6;

itemRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const items = await Item.find();
    res.send(items);
  })
);

itemRouter.get(
  "/genres",
  expressAsyncHandler(async (req, res) => {
    const genres = await Item.find().distinct("genre");
    res.send(genres);
  })
);

itemRouter.get(
  "/movies",
  expressAsyncHandler(async (req, res) => {
    const movies = await Item.find({ isSeries: false }); // Use the query parameter here to filter movies
    res.send(movies);
  })
);

itemRouter.get(
  "/series",
  expressAsyncHandler(async (req, res) => {
    const series = await Item.find({ isSeries: true }); // Use the query parameter here to filter movies
    res.send(series);
  })
);

itemRouter.get(
  "/token/:token",
  expressAsyncHandler(async (req, res) => {
    const { token } = req.params;
    const item = await Item.findOne({ token });
    item ? res.send(item) : res.status(404).send({ message: "Item not found" });
  })
);

itemRouter.get(
  "/id/:id",
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await Item.findById(id);
    item ? res.send(item) : res.status(404).send({ message: "Item not found" });
  })
);

// itemRouter.get(
//   "/search",
//   expressAsyncHandler(async (req, res) => {
//     const { query } = req;
//     const pageSize = query.pageSize || page_Size;
//     const page = query.page || 1;
//     const genre = query.genre || "";
//     const searchQuery = query.query || "";

//     const queryFilter = searchQuery && searchQuery !== "all" ? { title: { $regex: searchQuery, $options: "i" } } : {};
//     const genreFilter = genre && genre !== "all" ? { genre: { $regex: genre, $options: "i" } } : {};

//     const items = await Item.find({
//       ...queryFilter,
//       ...genreFilter,
//     })
//       // .sort(sortOrder)
//       .skip((page - 1) * pageSize)
//       .limit(pageSize);
//     const countItems = items.length;
//     res.send({ items, page, countItems, page: Math.ceil(countItems / pageSize) });
//   })
// );



itemRouter.get(
  "/search",
  expressAsyncHandler(async (req, res) => {
    const { query: searchQuery, genre } = req.query;

    // Check if required parameters are present
    if (!searchQuery || !genre) {
      return res.status(400).json({ message: "Both 'query' and 'genre' parameters are required." });
    }

    // Define filters based on query parameters
    const queryFilter = searchQuery !== "all" ? { title: { $regex: searchQuery, $options: "i" } } : {};
    const genreFilter = genre !== "all" ? { genre: { $regex: genre, $options: "i" } } : {};

    try {
      // Use Mongoose to query the database
      const items = await Item.find({
        ...queryFilter,
        ...genreFilter,
      });

      res.status(200).json({ items });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  })
);


itemRouter.get(
  "/random",
  expressAsyncHandler(async (req, res) => {
    const type = req.query.type;
    let item;
    try {
      if (type === "series") {
        item = await Item.aggregate([{ $match: { isSeries: true } }, { $sample: { size: 1 } }]);
      } else if (type === "movies") {
        item = await Item.aggregate([{ $match: { isSeries: false } }, { $sample: { size: 1 } }]);
      } else {
        item = await Item.aggregate([{ $sample: { size: 1 } }]);
      }
      res.status(200).json(item[0]);
    } catch (error) {
      res.status(500).json(error);
    }
  })
);

export default itemRouter;
