import { Application } from "express";
import authModule from "../components/auth/auth.module";
import userModule from "../components/user/user.module";
import scrapingModule from "../components/scraping/scraping.module";
import commentsModule from "../components/comments/comments.module";
import cloudinaryModule from "../components/cloudinary/cloudinary.module";

export default async (server: Application) => {
    server.use("/user", userModule.router);
    server.use("/auth", authModule.router);
    server.use("/scraping", scrapingModule.router);
    server.use("/comments", commentsModule.router);
    server.use("/services", cloudinaryModule.router);

    if (commentsModule.initialize) {
        await commentsModule.initialize();
    }
};