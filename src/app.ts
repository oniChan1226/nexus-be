import express, { Application, Request, Response, NextFunction } from "express"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import { config } from "./config/env"
import routes from "./routes"
import logger from "./config/logger"

const app: Application = express()

app.use(cors())
app.use(
    express.json({
        limit: "1MB",
    })
)
app.use(cookieParser())

const stream = {
    write: (message: string) => logger.info(message.trim()),
}
app.use(morgan("combined", { stream }))

app.use(config.API.prefix, routes)

app.get("/", (req: Request, res: Response) => {
    res.json({ status: "OK", environment: config.MAIN.nodeEnv })
})

export default app
