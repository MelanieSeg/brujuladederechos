import { v2 as cloudinary, ConfigOptions } from 'cloudinary'

cloudinary.config({
  cloud_name: 'dlnx4u8dt',
  api_key: '416953642422181',
  api_secret: 'H5cgyRbJHwjOR8tkMnGggb5HzzQ', // TODO: poner el api key en .env
  secure: true

} as ConfigOptions)

export default cloudinary;
