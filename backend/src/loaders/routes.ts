import { Application } from "express";
import authModule from "../components/auth/auth.module";
import userModule from "../components/user/user.module";
import scrapingModule from "../components/scraping/scraping.module";
//import authModule

//TODO: FIX el type del server
export default (server: Application) => {
  server.use("/user", userModule.router);
  server.use("/auth", authModule.router);
  server.use("/scraping", scrapingModule.router);
};
