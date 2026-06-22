import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../../../shared/response/ApiResponse';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    res.status(201).json(ApiResponse.success(result, 'Registration successful', req.reqId));
  };

  login = async (req: Request, res: Response) => {
    const ip = req.ip || req.connection.remoteAddress;
    const result = await this.authService.login(req.body, ip);
    res.status(200).json(ApiResponse.success(result, 'Login successful', req.reqId));
  };

  refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await this.authService.refreshToken(refreshToken);
    res.status(200).json(ApiResponse.success(result, 'Token refreshed successfully', req.reqId));
  };

  logout = async (req: Request, res: Response) => {
    // In stateless JWT, logout is usually handled client-side by destroying the tokens.
    // If refresh tokens are persisted in DB, revoke them here.
    res.status(200).json(ApiResponse.success(null, 'Logout successful', req.reqId));
  };

  me = async (req: Request, res: Response) => {
    // req.user is guaranteed by authenticate middleware
    const result = await this.authService.me(req.user!.id);
    res.status(200).json(ApiResponse.success(result, 'User profile retrieved', req.reqId));
  };
}
