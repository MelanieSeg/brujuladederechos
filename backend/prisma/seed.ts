import { CLASIFICACION, PrismaClient } from "@prisma/client";
// no ejecuten este archivo para no hacer otro seed
const prisma  = new PrismaClient();


function getRandomGravedad(): 'LEVE' | 'MODERADA' | 'GRAVE' {
  const niveles = ['LEVE', 'MODERADA', 'GRAVE'] as const;
  const indiceAleatorio = Math.floor(Math.random() * niveles.length);
  return niveles[indiceAleatorio];
}

async function seedComentariosClasificados(){
  const comments = await prisma.comentarioScraped.findMany({
    where:{
      clasificado:false,
    },
    take:20
  })


  for (const comment of comments) {
    const gravedad = getRandomGravedad();
    await prisma.comentarioClasificado.create({
      data: {
        clasificadorId: 'cm1ss8hjx0000tnhe0y17kb33',//se que esto es muy mala practica :o, pero como son usuarios falsos xd  
        comentarioScrapedId: comment.id,
        clasificacion: CLASIFICACION.MANUAL,
        gravedad: gravedad, 
        notas: `Clasificación de seed con gravedad ${gravedad}`,
      },
    });

    await prisma.comentarioScraped.update({
      where: { id: comment.id },
      data: { clasificado: true, fechaClasificacion: new Date() },
    });
  }

  console.log('Seed completado: 20 comentarios clasificados con gravedad aleatoria');
}


seedComentariosClasificados()
.then(()=>prisma.$disconnect())
.catch(async (err)=>{
  console.log(err);
  await prisma.$disconnect();
  process.exit(1)
})