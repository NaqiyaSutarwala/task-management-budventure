import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: 'low' })
  priority: string;

  @Prop()
  dueDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo: Types.ObjectId;

  @Prop([String])
  tags: string[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
