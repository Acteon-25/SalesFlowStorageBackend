import { Router } from "express"
import { AuthController } from "../controllers/auths.js"
import { authRequired } from "../middlewares/validateToken.js"

export const createAuthRouter = ({ authModel }) => {
  const authsRouter = Router()

  const authController = new AuthController({ authModel })

  authsRouter.post("/register", authController.register)
  authsRouter.post("/login", authController.login)
  authsRouter.post("/logout", authController.logout)
  authsRouter.get("/profile", authRequired, authController.profile)

  return authsRouter
}