import express from "express"
import { deleteUserController, loginController, logoutController, meController, registerController } from "../controllers/auth.controller.js"
import authMiddleware from "../middlewares/authMiddleware.js"

const router = express.Router()

router.post("/register",registerController)
router.post("/login",loginController)
router.post("/logout",logoutController)
router.get("/me", authMiddleware, meController) 
router.delete("/delete/:id",authMiddleware, deleteUserController);


export default router