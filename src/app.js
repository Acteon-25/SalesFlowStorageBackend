import express from "express"
import cookieParser from "cookie-parser"
import { createItemRouter } from "./routes/item.js"
import { createAuthRouter } from "./routes/auth.js"
import { createSaleRouter } from "./routes/sale.js"

import { corsMiddleware } from "./middlewares/cors.js"

import { POSTGRES_DB_URL } from './config.js';

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: POSTGRES_DB_URL,
  ssl: { rejectUnauthorized: false }
});


export const createApp = ({ authModel, itemModel, saleModel }) => {
  const app = express()
  app.use(corsMiddleware())
  app.use(express.json())
  app.use(cookieParser())
  app.disable("x-powered-by")

  app.use("/auth", createAuthRouter({ authModel }))
  app.use("/item", createItemRouter({ itemModel }))
  app.use("/sale", createSaleRouter({ saleModel }))

  app.get("/ping-db", async (req, res) => {
    try {
      const result = await pool.query("SELECT NOW()");
      res.json({
        message: "pong with DB ✅",
        time: result.rows[0].now
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "DB connection failed ❌" });
    }
  })


  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`)
  })
}