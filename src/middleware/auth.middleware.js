import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if(!token) return res.status(401).json({ message: "No  autherization token, access denied"});
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if(!user) return res.status(401).json({ message: "Token is not valid!"});
        req.user = user;
        next();
    } catch (error) {
        console.log("Authentication error",error.message);
        res.status(401).json({ message: "Token is not valid?"});
    }
};

export default protectRoute;
