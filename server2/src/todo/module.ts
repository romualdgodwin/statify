import { TodoController } from './controller.ts';
import { TodoService } from './service.ts';
import { Module, TokenInjector } from '@danet/core';
import { USER_REPOSITORY } from './constant.ts';
import { PostgresRepository } from "./postgres-repository.ts";
import { DatabaseModule } from "../database/module.ts";
import { TodoViewController } from './view.controller.ts';

@Module({
  controllers: [TodoController, TodoViewController],
  injectables: [new TokenInjector(PostgresRepository, USER_REPOSITORY), TodoService], // change InMemoryTodoRepository by any custom repository using other database engine if needed
    imports: [DatabaseModule]
})
export class TodoModule {}
