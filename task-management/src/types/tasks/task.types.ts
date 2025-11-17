import type { IUser } from "../users/user.types";

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assignedTo?: IUser;
  assignedBy?: IUser;
  dueDate?: string;
  createdAt: string;
}
