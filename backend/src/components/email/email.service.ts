import { Transporter } from "nodemailer";
import { transport } from "../../config/mailtrap";
import { PrismaClient, TipoToken } from "@prisma/client";
import { generateRandomToken } from "../../utils";
import { Resend } from "resend";
import { resend } from "../../config/resend";

interface sendEmailInterface {
  id: string;
  userEmail: string;
  userName: string;
  rol: string;
}

class EmailService {
  private transport: Transporter;
  private resend: Resend
  private prisma: PrismaClient;
  constructor() {
    this.transport = transport;
    this.prisma = new PrismaClient();
    this.resend = resend
  }

  sendEmailVerification = async (userData: sendEmailInterface) => {
    const token = await this.createVerificationToken(userData.id);
    const confirmationLink = `http://localhost:3000/confirmar-cuenta?token=${token}`;


    await this.resend.emails.send({
      from: "Brujula_de_derechos <onboarding@resend.dev>",
      to: userData.userEmail,
      subject: "Brujula de derechos digitales - Confirma tu cuenta",
      html: `<p>Hola : ${userData.userName}, se ha creado una cuante en nuestra aplicacion de Brujula de derechos digitales con el rol de ${userData.rol}. Para poder usar nuestra aplicacion porfavor confirma tu cuenta  </p>
              <p>Ingresa al siguiente enlace:</p>
<p> y ingresa el siguiente codigo:<b>${token}</b> </p>
<a href="${confirmationLink}">Verificar cuenta</a></p>
<p>este token expira en: 10 minutos</p>
`,
    });
  };

  sendEmailResetPassword = async (
    userData: Omit<sendEmailInterface, "rol">,
  ) => {
    const token = await this.createRestartPasswordToken(userData.id);
    const validationTokenLink = `http://localhost:3000/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: "Brujula_de_derechos <onboarding@resend.dev>",
      to: userData.userEmail,
      subject: "Brujula de derechos digitales - Recuperar contraseña",
      html: `<p>Hola, haz solicitado la recuperacion de contraseña</p>
              <p>Ingresa al siguiente enlace para inicar el proceso de creacion de tu nueva contraseña:</p>
<a href="${validationTokenLink}">Recperar contraseña</a>
<p> y ingresa el siguiente codigo:<b>${token}</b> </p>
<p>este codigo expira en: 10 minutos</p>
`,
    });
  };

  createVerificationToken = async (userId: string): Promise<string> => {
    const generatedToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    const tokenRecord = await this.prisma.userToken.upsert({
      where: {
        userId_tipo_unique: {
          userId: userId,
          tipo: TipoToken.VERIFICATION
        }
      },
      update: {
        token: generatedToken,
        expireAt: expiresAt,
      },
      create: {
        token: generatedToken,
        userId: userId,
        expireAt: expiresAt,
        tipo: TipoToken.VERIFICATION
      },
    });

    return tokenRecord.token;
  };

  //vetnajas de usar upsert: 1. Eficiencai : evitamso la necesidad de eliminar y crear regitros por separado
  //2. atomicidad : Realizar las operaciones en una sola transaccion
  createRestartPasswordToken = async (userId: string): Promise<string> => {
    const generatedToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
    const tokenRecord = await this.prisma.userToken.upsert({
      where: {
        userId_tipo_unique: {
          userId: userId,
          tipo: TipoToken.RESET_PASSWORD
        }
      },
      update: {
        token: generatedToken,
        expireAt: expiresAt,
      },
      create: {
        token: generatedToken,
        userId: userId,
        tipo: TipoToken.RESET_PASSWORD,
        expireAt: expiresAt,
      },
    });

    return tokenRecord.token;
  };
}

export default EmailService;
