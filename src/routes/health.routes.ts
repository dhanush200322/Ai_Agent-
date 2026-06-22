import { Router, Request, Response } from 'express';
import { ApiResponse } from '../shared/response/ApiResponse';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json(ApiResponse.success({ status: 'OK' }, 'Health check passed', req.reqId));
});

export default router;
