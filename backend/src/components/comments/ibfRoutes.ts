import { Router, Request, Response } from 'express';
import { evaluarComentario } from '../../utils/ibfService';

const router = Router();

router.post('/evaluar-comentario', (req: Request, res: Response) => {
    try {
        const comentario = req.body;
        const resultado = evaluarComentario(comentario);
        res.json(resultado);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

export default router;