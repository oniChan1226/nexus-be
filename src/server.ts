import app from "./app"
import { connectDB } from "./config"
import { config } from "./config/env"

const startServer = async () => {
    await connectDB() // ✅ Wait until Mongo is ready

    app.listen(config.MAIN.port, () => {
        console.log(`🚀 Server running at http://localhost:${config.MAIN.port}`)
    })
}

startServer()
