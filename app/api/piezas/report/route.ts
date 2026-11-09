import { Piezas, createReportProblemRoute } from '@piezas/sdk';
import { identity, AppError } from '@/lib/safety/auth';

// Added by Piezas: saves "Report a problem" reports in this app's own records.
// Keep it: whether the button shows is the owner's answer at each deploy.
const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY! });
export const { GET, POST } = createReportProblemRoute({ piezas, identify: async()=>{try{const who=await identity();return {id:who.userId,email:who.email,name:who.name};}catch(error){if(error instanceof AppError&&error.status===401)return null;throw error;}} });
