import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(email: string, password: string, name?: string) {
    const hashed = await bcrypt.hash(password, 10);
    const created = new this.userModel({ email, password: hashed, name });
    return created.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password').exec();
  }

  async verifyPassword(user: User, password: string) {
    return bcrypt.compare(password, user.password);
  }

  async findAllBasic() {
    return this.userModel.find().select('email name').exec();
  }

  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ) {
    await this.userModel
      .findByIdAndUpdate(userId, { refreshTokenHash }, { new: true })
      .exec();
  }

  async getUserWithSensitiveById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async clearRefreshToken(userId: string) {
    await this.updateRefreshTokenHash(userId, null);
  }
}
