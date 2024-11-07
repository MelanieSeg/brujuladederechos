import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

//no se va a crear un clase para este caso por que seria aumentar la complejidad sin razon



const storage = multer.memoryStorage()

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y GIF.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // osea 5mb
  },
});

export default upload;
