import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { UsersModule } from './users/users.module';
// import { AuthModule } from './auth/auth.module';
// import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/taskapp',
    ),
    UsersModule,
    AuthModule,
    TasksModule,
    // UsersModule,
    // AuthModule,
    // TasksModule,
  ],
})
export class AppModule {}
