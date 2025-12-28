import { Controller, Get, Post, Param, Body, Res, Delete } from '@nestjs/common';
import { Response } from 'express';
import { EdgeService } from '../edge/edge.service';
import { SettingsService, CreateSettingsDto } from '../services/settings.service';
import { BackupsService } from '../services/backups.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly edge: EdgeService,
    private readonly settingsService: SettingsService,
    private readonly backupsService: BackupsService,
  ) {}

  private readonly defaultPorts: Record<string, number> = {
    mysql: 3306,
    postgresql: 5432,
    mongodb: 27017,
  };

  /**
   * Parse connection string into individual components
   * Formats:
   * - mysql://user:password@host:port/database
   * - postgresql://user:password@host:port/database
   * - mongodb://user:password@host:port/database?authSource=admin
   */
  private parseConnectionString(connectionString: string): {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  } {
    try {
      const url = new URL(connectionString);

      return {
        host: url.hostname || 'localhost',
        port: url.port ? parseInt(url.port, 10) : this.defaultPorts[url.protocol.replace(':', '')] || 3306,
        username: decodeURIComponent(url.username || ''),
        password: decodeURIComponent(url.password || ''),
        database: url.pathname.replace('/', '') || '',
      };
    } catch {
      // Fallback for invalid URLs
      return {
        host: 'localhost',
        port: 3306,
        username: '',
        password: '',
        database: '',
      };
    }
  }

  /**
   * Build connection string from individual fields
   */
  private buildConnectionString(data: {
    database_type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }): string {
    const { database_type, host, port, username, password, database } = data;
    const defaultPort = this.defaultPorts[database_type] || 3306;
    const actualPort = port || defaultPort;
    const actualHost = host || 'localhost';

    let connString = `${database_type}://`;
    if (username) {
      connString += encodeURIComponent(username);
      if (password) {
        connString += ':' + encodeURIComponent(password);
      }
      connString += '@';
    }
    connString += `${actualHost}:${actualPort}/${database || ''}`;

    if (database_type === 'mongodb') {
      connString += '?authSource=admin';
    }

    return connString;
  }

  /**
   * Process connection data - parse or build connection string as needed
   */
  private processConnectionData(body: Record<string, any>): void {
    // Handle database_from_string field (from connection string mode)
    if (body.database_from_string && !body.database) {
      body.database = body.database_from_string;
    }
    delete body.database_from_string;

    if (body.connection_string) {
      // Parse connection string to extract individual fields
      const parsed = this.parseConnectionString(body.connection_string);
      Object.assign(body, parsed);
    } else if (body.host || body.database) {
      // Build connection string from individual fields
      body.connection_string = this.buildConnectionString({
        database_type: body.database_type,
        host: body.host,
        port: parseInt(body.port, 10) || 0,
        username: body.username || '',
        password: body.password || '',
        database: body.database || '',
      });
    }
  }

  @Get()
  async index(@Res() res: Response) {
    const settings = await this.settingsService.findAll();

    const html = await this.edge.render('pages/settings/index', {
      title: 'Backup Settings',
      settings,
    });

    res.type('html').send(html);
  }

  @Get('new')
  async create(@Res() res: Response) {
    const html = await this.edge.render('pages/settings/form', {
      title: 'New Backup Setting',
      setting: null,
      isEdit: false,
    });

    res.type('html').send(html);
  }

  @Get(':id/edit')
  async edit(@Param('id') id: string, @Res() res: Response) {
    const setting = await this.settingsService.findById(id);
    if (!setting) {
      return res.redirect('/settings');
    }

    const html = await this.edge.render('pages/settings/form', {
      title: 'Edit Backup Setting',
      setting,
      isEdit: true,
    });

    res.type('html').send(html);
  }

  @Post()
  async store(@Body() body: Record<string, any>, @Res() res: Response) {
    // Process connection data (parse string or build from fields)
    this.processConnectionData(body);
    // Community edition: compress and encrypt are disabled (premium features)
    body.compress = false;
    body.encrypt = false;
    body.enabled = true;
    await this.settingsService.create(body as CreateSettingsDto);
    res.redirect('/settings');
  }

  @Post(':id')
  async update(@Param('id') id: string, @Body() body: Record<string, any>, @Res() res: Response) {
    // Process connection data (parse string or build from fields)
    this.processConnectionData(body);
    // Community edition: compress and encrypt are disabled (premium features)
    body.compress = false;
    body.encrypt = false;
    body.enabled = body.enabled === 'on' || body.enabled === true;
    await this.settingsService.update(id, body);
    res.redirect('/settings');
  }

  @Post(':id/delete')
  async destroy(@Param('id') id: string, @Res() res: Response) {
    await this.settingsService.delete(id);
    res.redirect('/settings');
  }

  @Post(':id/execute')
  async execute(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.settingsService.executeBackup(id);
      res.redirect('/settings?success=backup_started');
    } catch (error) {
      res.redirect('/settings?error=backup_failed');
    }
  }

  // API endpoints
  @Post('api/:id/execute')
  async apiExecute(@Param('id') id: string) {
    const result = await this.settingsService.executeBackup(id);
    return { success: true, ...result };
  }

  @Get('api/:id/status')
  async apiStatus(@Param('id') id: string) {
    const backups = await this.backupsService.findBySettingsId(id);
    const latestBackup = backups[0];

    if (!latestBackup) {
      return { status: 'none', message: 'No backups yet' };
    }

    return {
      status: latestBackup.status,
      backupId: latestBackup._id,
      startedAt: latestBackup.started_at,
      completedAt: latestBackup.completed_at,
      duration: latestBackup.duration_ms,
      fileSize: latestBackup.file_size,
      error: latestBackup.error_message,
    };
  }

  @Get('api/list')
  async apiList() {
    return this.settingsService.findAll();
  }

  @Delete('api/:id')
  async apiDelete(@Param('id') id: string) {
    await this.settingsService.delete(id);
    return { success: true };
  }
}
