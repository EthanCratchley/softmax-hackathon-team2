import { Piezas, createReportProblemRoute } from '@piezas/sdk';

// Added by Piezas: saves "Report a problem" reports in this app's own records.
// Keep it: whether the button shows is the owner's answer at each deploy.
const piezas = new Piezas({ apiKey: process.env.PIEZAS_API_KEY! });
const reportProblemRoute = createReportProblemRoute({ piezas });

// Next 16 requires the request argument for route handlers, while the Piezas
// GET helper also permits it to be omitted for direct function calls.
export async function GET(request: Request) {
  return reportProblemRoute.GET(request);
}

export const POST = reportProblemRoute.POST;
