import { Router } from "express"
import { ItemController } from "../controllers/items.js"

export const createItemRouter = ({ itemModel }) => {
  const itemsRouter = Router()

  const itemController = new ItemController({ itemModel })

  itemsRouter.get("/", itemController.getAll)
  itemsRouter.get("/:id", itemController.getById)

  itemsRouter.post("/", itemController.create)
  itemsRouter.delete("/:id", itemController.delete)
  itemsRouter.patch("/:id", itemController.update)

  return itemsRouter
}