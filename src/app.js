import express from "express"
import cookieParser from "cookie-parser"
import { createItemRouter } from "./routes/item.js"
import { createAuthRouter } from "./routes/auth.js"
import { createSaleRouter } from "./routes/sale.js"

import { corsMiddleware } from "./middlewares/cors.js"

export const createApp = ({ authModel, itemModel, saleModel }) => {
  const app = express()
  app.use(corsMiddleware())
  app.use(express.json())
  app.use(cookieParser())
  app.disable("x-powered-by")

  app.use("/auth", createAuthRouter({ authModel }))
  app.use("/item", createItemRouter({ itemModel }))
  app.use("/sale", createSaleRouter({ saleModel }))

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`)
  })
}