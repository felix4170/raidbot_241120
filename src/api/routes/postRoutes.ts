import { getPostDetails } from "../controller/postController";
import express from "express";

const router = express.Router();



router.get("/get-post/:tweetId",getPostDetails);

export default router;
