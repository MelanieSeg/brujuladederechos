import { Application } from "express";
import authModule from "../components/auth/auth.module";
import userModule from "../components/user/user.module";
import scrapingModule from "../components/scraping/scraping.module";
import commentsModule from "../components/comments/comments.module";
import cloudinaryModule from "../components/cloudinary/cloudinary.module";
import resumentModule from "../components/resumen/resument.module";
import auditoriaModule from "../components/auditoria/auditoria.module";
import userConfigModule from "../components/user-configuration/user-config.module";

export default async (server: Application) => {
  server.use("/user", userModule.router);
  server.use("/auth", authModule.router);
  server.use("/scraping", scrapingModule.router);
  server.use("/comments", commentsModule.router);
  server.use('/services', cloudinaryModule.router)
  server.use("/resumen", resumentModule.router)
  server.use("/auditoria", auditoriaModule.router)
  server.use("/configuration", userConfigModule.router)

  if (commentsModule.initialize) {
    await commentsModule.initialize()
  }
};
