import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const authUsername = process.env.AUTH_USERNAME;
    const authPassword = process.env.AUTH_PASSWORD;

    // If no credentials configured, allow access
    if (!authUsername || !authPassword) {
      return true;
    }

    // Check for authentication cookie
    const authCookie = request.cookies?.vaultdb_auth;
    if (authCookie) {
      try {
        const decoded = Buffer.from(authCookie, 'base64').toString('utf-8');
        const [username] = decoded.split(':');
        if (username === authUsername) {
          return true;
        }
      } catch {
        // Invalid cookie, redirect to login
      }
    }

    // Redirect to login page
    response.redirect('/auth/login');
    return false;
  }
}
