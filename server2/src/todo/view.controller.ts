import { Controller, Get, Param} from '@danet/core';
import { TodoService } from './service.ts';
import { Render } from 'https://jsr.io/@danet/core/2.4.3/src/renderer/decorator.ts';

@Controller('todoview')
export class TodoViewController {
  constructor(public todoService: TodoService) {
  }

  @Render('todo')
  @Get(':id')
  async getTodoById(@Param('id') todoId: string) {
    return this.todoService.getById(todoId);
  }
}
