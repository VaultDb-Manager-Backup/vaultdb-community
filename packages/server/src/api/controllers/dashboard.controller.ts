import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { EdgeService } from '../edge/edge.service';
import { SettingsService } from '../services/settings.service';
import { BackupsService } from '../services/backups.service';

@Controller()
export class DashboardController {
  constructor(
    private readonly edge: EdgeService,
    private readonly settingsService: SettingsService,
    private readonly backupsService: BackupsService,
  ) {}

  @Get()
  async index(@Res() res: Response) {
    const [settings, backups, stats] = await Promise.all([
      this.settingsService.findAll(),
      this.backupsService.findAll(10),
      this.backupsService.getStats(),
    ]);

    const html = await this.edge.render('pages/dashboard/index', {
      title: 'Dashboard',
      settings,
      backups,
      stats,
    });

    res.type('html').send(html);
  }
}
