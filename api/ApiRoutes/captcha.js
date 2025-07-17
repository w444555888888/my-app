import express from "express";
import { init, verify } from "../RoutesController/captcha.js";

const router = express.Router();

router.get("/init", init);
router.post("/verify", verify);

export default router;
