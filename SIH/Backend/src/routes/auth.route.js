import express from "express"
import { deleteUserController, loginController, logoutController, registerController } from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/register",registerController)
router.post("/login",loginController)
router.post("/logout",logoutController)
router.delete("/delete/:id", deleteUserController);

export default router