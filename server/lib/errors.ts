export class SQLITEError extends Error {
    // Logical inference of SQLITE error messages
    static isSQLITEError(err: Error): boolean {
        const bool =
            err && "code" in err && (err["code"] as string).includes("SQLITE");
        return bool;
    }
}
