import { Router } from "express"
import { SaleController } from "../controllers/sale.js"
import { authRequired } from "../middlewares/validateToken.js"

export const createSaleRouter = ({ saleModel }) => {
  const salesRouter = Router()

  const saleController = new SaleController({ saleModel })

  salesRouter.get("/", authRequired, saleController.getAll)
  salesRouter.get("/:id", authRequired, saleController.getById)

  salesRouter.post("/", authRequired, saleController.create)
  salesRouter.delete("/:id", authRequired, saleController.delete)

  return salesRouter
}