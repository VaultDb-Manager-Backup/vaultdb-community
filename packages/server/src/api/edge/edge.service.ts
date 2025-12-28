import { Injectable, OnModuleInit } from '@nestjs/common';
import { Edge } from 'edge.js';
import { join } from 'path';

@Injectable()
export class EdgeService implements OnModuleInit {
  private edge: Edge;

  onModuleInit() {
    this.edge = Edge.create();

    // Configure views path
    // Docker prod: /app/views (copied)
    // Docker dev: /app/packages/server/views (mounted)
    // Local dev: relative to compiled file
    const isDocker = process.env.MONGODB_URI?.includes('mongo:') || false;
    const isDev = process.env.NODE_ENV === 'development';

    let viewsPath: string;
    if (isDocker && isDev) {
      viewsPath = join(process.cwd(), 'packages', 'server', 'views');
    } else if (isDocker) {
      viewsPath = join(process.cwd(), 'views');
    } else {
      viewsPath = join(__dirname, '..', '..', '..', '..', 'views');
    }

    this.edge.mount(viewsPath);

    // Register global data
    this.edge.global('appName', 'VaultDB');
    this.edge.global('appVersion', '0.1.0');
  }

  async render(template: string, data: Record<string, unknown> = {}): Promise<string> {
    return this.edge.render(template, data);
  }

  getEdge(): Edge {
    return this.edge;
  }
}
