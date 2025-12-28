import { Module, Global } from '@nestjs/common';
import { EdgeService } from './edge.service';

@Global()
@Module({
  providers: [EdgeService],
  exports: [EdgeService],
})
export class EdgeModule {}
