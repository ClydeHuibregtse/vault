import { makeApp, logger } from "./app";

const app = makeApp();
const port = 3000
const server = app.listen(port, "0.0.0.0", () => {
    logger.info(`Vault listening on port ${port}`)
})