import { Resend } from 'resend'
import dotenv from 'dotenv'


dotenv.config()

export const resend = new Resend(process.env.RESEND_KEY || "re_4pEqrWRb_88uSyzt4PDb5pwuaR4rjFi9r")

