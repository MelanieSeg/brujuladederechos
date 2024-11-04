import express from 'express'
import CloudinaryController from "./cloudinary.controller";
import upload from './multer.middleware';



class CloudinaryRouter {
  constructor(
    private readonly cloudinaryController: CloudinaryController
  ) { }


  get router() {
    const router = express.Router();
    return router
  }
}


export default CloudinaryRouter
