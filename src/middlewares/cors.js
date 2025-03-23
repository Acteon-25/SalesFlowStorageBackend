import cors from "cors"

const ACCEPTED_ORIGINS = [
  "https://salesflowstoragefrontend.pages.dev",
]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error("Not allowed by CORS"))
  },
  credentials: true,
})