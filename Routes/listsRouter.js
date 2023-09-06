import express from "express";
import expressAsyncHandler from "express-async-handler";
import List from "../Models/ListModel.js";
import { isAuth } from "../utils.js";
import Item from "../Models/ItemModel.js";

const listsRouter = express.Router();

listsRouter.post(
  "/create",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin) {
      const newList = new List(req.body);
      //console.log('before' + newList);
      try {
        const savedList = await newList.save();
        //console.log('after' + savedList);
        res.status(200).json(savedList);
      } catch (error) {
        res.status(500).json(error);
      }
    } else res.status(403).json({ message: "you are not allowed to create" });
  })
);

//get list

// listsRouter.get(
//   "/get",
//   expressAsyncHandler(async (req, res) => {
//     //isAuth,
//     const typeQuery = req.query.type;
//     const genreQuery = req.query.genre;
//     let list = [];
//     //console.log(" req: " , req.query);

//     try {

//       if (typeQuery) {
//         if (genreQuery) {
//           list = await List.aggregate([{ $sample: { size: 10 } }, { $match: { type: typeQuery, genre: genreQuery } }]);
//           list = await List.populate(list, { path: "items" });
//         } else {
//           list = await List.aggregate([{ $sample: { size: 10 } }, { $match: { type: typeQuery } }]);
//           list = await List.populate(list, { path: "items" });

//         }
//       } else {
//         list = await List.find({ type: { $in: ["series", "movies"] } })  //{ type: { $in: ["series", "movies"] } }
//           .populate("items")
//           .exec();
//       }
//       //console.log("type:" + typeQuery , "genere:"  + {genreQuery});
//       res.status(200).json(list);
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   })
// );

listsRouter.get("/get", isAuth, async (req, res) => {
  const typeQuery = req.query.type;
  const genreQuery = req.query.genre;
  /* console.log(`type:${typeQuery} genere:${genreQuery}`);*/

  let list = [];
  try {
    if (typeQuery) {
      if (genreQuery) {
        list = await List.aggregate([{ $sample: { size: 10 } }, { $match: { type: typeQuery, genre: genreQuery } }]);
        list = await List.populate(list, { path: "items" });
      } else {
        list = await List.aggregate([{ $sample: { size: 10 } }, { $match: { type: typeQuery } }]);
        list = await List.populate(list, { path: "items" });
      }
    } else {
      //console.log(typeQuery);
      list = await List.find({ type: { $in: ["movies", "series"] } })
        .populate("items")
        .exec();
      //console.log("hhhhh");
    }
    //console.log(list);
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json(err);
    console.log(err.message);
  }
});

//delete list

listsRouter.delete(
  "/delete/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin) {
      try {
        await List.findByIdAndDelete(req.params.id);
        res.status(201).json(`The list ${req.params.id} has been deleted...`);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("You are not allowed!");
    }
  })
);

listsRouter.get(
  "/savetomylist/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      //console.log(req.user);
      let list = await List.findOne({ type: { $eq: req.user._id } });
      const newItem = await Item.findById(req.params.id);
      //console.log(newItem);
      //console.log(list);
      if (!list) {
        list = new List({
          title: `${req.user.username}'s List`,
          type: req.user._id,
          genre: "all",
          items: [],
        });
        //console.log(list);
      }
      var found = list.items.indexOf(newItem._id);
      //console.log("found Item: " + found);
      if (found !== -1) {
      } else {
        list.items.push(newItem._id);
      }

      await list.save();

      list = await List.populate(list, { path: "items" });

      res.status(200).json(list);
    } catch (err) {
      res.status(500).json(err);
      console.log(err.message);
    }
  })
);

listsRouter.get(
  "/removefrommylist/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      let list = await List.findOne({ type: { $eq: req.user._id } });
      const itemToRemove = await Item.findById(req.params.id);
      //console.log(list.items);
      //console.log(itemToRemove._id);
      var found = list.items.indexOf(itemToRemove._id);
      //console.log(found);
      if (found !== -1) {
        list.items.splice(found, 1);
      }
      await list.save();
      //console.log(list.items);
      list = await List.populate(list, { path: "items" });
      res.status(200).json(list);
    } catch (err) {
      res.status(500).json(err);
    }
  })
);

export default listsRouter;
