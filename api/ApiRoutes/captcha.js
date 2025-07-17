import express from "express";
import { initCaptcha, verifyCaptcha } from "../RoutesController/captcha.js";

const router = express.Router();

router.get("/initCaptcha", initCaptcha);
router.post("/verifyCaptcha", verifyCaptcha);

export default router;
