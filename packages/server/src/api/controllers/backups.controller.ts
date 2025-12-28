import { Controller, Get, Param, Res, Delete, Query } from '@nestjs/common';
import { Response } from 'express';
import { EdgeService } from '../edge/edge.service';
import { BackupsService } from '../services/backups.service';

@Controller('backups')
export class BackupsController {
  constructor(
    private readonly edge: EdgeService,
    private readonly backupsService: BackupsService,
  ) {}

  @Get()
  async index(@Query('page') pageParam: string, @Res() res: Response) {
    const page = Math.max(1, parseInt(pageParam, 10) || 1);
    const limit = 20;

    const result = await this.backupsService.findAllPaginated(page, limit);

    const html = await this.edge.render('pages/backups/index', {
      title: 'Backup History',
      backups: result.data,
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        limit: result.limit,
      },
    });

    res.type('html').send(html);
  }

  @Get(':id')
  async show(@Param('id') id: string, @Res() res: Response) {
    const backup = await this.backupsService.findById(id);
    if (!backup) {
      return res.redirect('/backups');
    }

    const html = await this.edge.render('pages/backups/show', {
      title: 'Backup Details',
      backup,
    });

    res.type('html').send(html);
  }

  // API endpoints
  @Get('api/list')
  async apiList() {
    return this.backupsService.findAll();
  }

  @Get('api/stats')
  async apiStats() {
    return this.backupsService.getStats();
  }

  @Delete('api/:id')
  async apiDelete(@Param('id') id: string) {
    await this.backupsService.delete(id);
    return { success: true };
  }
}
