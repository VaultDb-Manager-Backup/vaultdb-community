import { Controller, Get, Post, Body, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { EdgeService } from '../edge/edge.service';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly edge: EdgeService) {}

  @Public()
  @Get('login')
  async loginPage(@Req() req: Request, @Res() res: Response) {
    // If already authenticated, redirect to dashboard
    if (req.cookies?.vaultdb_auth) {
      return res.redirect('/');
    }

    const html = await this.edge.render('pages/auth/login', {
      error: null,
    });

    res.type('html').send(html);
  }

  @Public()
  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res() res: Response,
  ) {
    const authUsername = process.env.AUTH_USERNAME;
    const authPassword = process.env.AUTH_PASSWORD;

    // If no auth configured, redirect to dashboard
    if (!authUsername || !authPassword) {
      return res.redirect('/');
    }

    if (body.username === authUsername && body.password === authPassword) {
      // Set authentication cookie (24 hours)
      const token = Buffer.from(`${body.username}:${Date.now()}`).toString('base64');
      res.cookie('vaultdb_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
      });
      return res.redirect('/');
    }

    // Invalid credentials
    const html = await this.edge.render('pages/auth/login', {
      error: 'Invalid username or password',
    });

    res.status(401).type('html').send(html);
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('vaultdb_auth');
    res.redirect('/auth/login');
  }
}
