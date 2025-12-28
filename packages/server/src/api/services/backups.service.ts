import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Backup, BackupDocument } from '../schemas/backup.schema';

@Injectable()
export class BackupsService {
  constructor(
    @InjectModel(Backup.name)
    private backupModel: Model<BackupDocument>,
  ) {}

  async findAll(limit = 50): Promise<BackupDocument[]> {
    return this.backupModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findAllPaginated(
    page = 1,
    limit = 20,
  ): Promise<{
    data: BackupDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.backupModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.backupModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<BackupDocument | null> {
    return this.backupModel.findById(id).exec();
  }

  async findBySettingsId(settingsId: string): Promise<BackupDocument[]> {
    return this.backupModel
      .find({ settings_id: new Types.ObjectId(settingsId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    running: number;
    totalSize: number;
  }> {
    const [stats] = await this.backupModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          running: { $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] } },
          totalSize: { $sum: { $ifNull: ['$file_size', 0] } },
        },
      },
    ]);

    return stats || { total: 0, completed: 0, failed: 0, running: 0, totalSize: 0 };
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.backupModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
