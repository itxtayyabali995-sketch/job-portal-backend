import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "user not authenticated",
                success: false,
            });
        }

        const decode = jwt.verify(
            token,
            process.env.SECRET_KEY
        );

        console.log("JWT VERIFIED SUCCESSFULLY");
        console.log("Decoded userId:", decode.userId);

        req.id = decode.userId;

        next();

    } catch (error) {
        console.error("JWT AUTH ERROR");
        console.error("Name:", error.name);
        console.error("Message:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token",
            success: false,
        });
    }
};

export default isAuthenticated;