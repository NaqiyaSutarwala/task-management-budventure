import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task, TaskDocument } from './schema/task.schema';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(dto: CreateTaskDto, userId: string) {
    const t = new this.taskModel({
      ...dto,
      assignedBy: userId,
      assignedTo: dto.assignedTo ?? userId,
    });
    return t.save();
  }

  async findAll(query: any, userId: string) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;
    const scope = String(query?.scope || 'toMe');
    const q: any = scope === 'byMe' ? { assignedBy: userId } : { assignedTo: userId };
    if (search)
      q.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    if (status) q.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await this.taskModel.countDocuments(q);
    const tasks = await this.taskModel
      .find(q)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('assignedTo', 'email name')
      .populate('assignedBy', 'email name')
      .exec();
    return { tasks, total, page: Number(page), limit: Number(limit) };
  }

  async findOne(id: string, userId: string) {
    return this.taskModel
      .findOne({ _id: id, $or: [{ assignedTo: userId }, { assignedBy: userId }] })
      .populate('assignedTo', 'email name')
      .populate('assignedBy', 'email name')
      .exec();
  }

  async update(id: string, dto: Partial<CreateTaskDto>, userId: string) {
    return this.taskModel
      .findOneAndUpdate(
        { _id: id, $or: [{ assignedTo: userId }, { assignedBy: userId }] },
        dto,
        { new: true },
      )
      .populate('assignedTo', 'email name')
      .populate('assignedBy', 'email name')
      .exec();
  }

  async remove(id: string, userId: string) {
    return this.taskModel
      .findOneAndDelete({ _id: id, $or: [{ assignedTo: userId }, { assignedBy: userId }] })
      .exec();
  }

  async stats(userId: string) {
    const base = { assignedTo: userId };
    const total = await this.taskModel.countDocuments(base);
    const completed = await this.taskModel.countDocuments({
      ...base,
      status: 'completed',
    });
    const pending = await this.taskModel.countDocuments({
      ...base,
      status: { $ne: 'completed' },
    });
    return { total, completed, pending };
  }
}
