import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./Routes/userRouter.js";
import seedRouter from "./Routes/seedRouter.js";
import itemRouter from "./Routes/itemRouter.js";
import listsRouter from "./Routes/listsRouter.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/seed", seedRouter);
app.use("/api/items", itemRouter);
app.use("/api/lists", listsRouter);

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    app.listen(PORT);
    console.log("server listening on port " + PORT);
  })

  .catch((e) => console.log(e));
