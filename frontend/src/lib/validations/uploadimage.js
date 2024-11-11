
import * as yup from 'yup'


export const uploadImageSchema = yup.object().shape({
  image: yup.mixed().required("Se requiere una imagen")
    .test('fileSize', 'El archivo es muy grande', (value) => {
      return value && value[0] && value[0].size <= 5 * 1034 * 1024;
    })
    .test('fileType', 'El formato del archivo no es válido', (value) => {
      return (
        value &&
        value[0] &&
        ['image/jpeg', 'image/png', 'image/gif'].includes(value[0].type)
      );
    }),
})
