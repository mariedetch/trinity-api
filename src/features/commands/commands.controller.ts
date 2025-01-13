import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommandsService } from './commands.service';
import { CreateCommandDto } from './dto/create-command.dto';
import { ApiDefaultErrorResponse } from 'src/common/decorators/responses/api-default-error-response.decorator';
import { JsonResponse } from 'src/common/helpers/json-response.helper';
import { CommandDto } from './dto/command.dto';

@Controller('commands')
@ApiTags('commands')
export class CommandsController {
  constructor(private readonly commandsService: CommandsService) {}

  @Post()
  @ApiDefaultErrorResponse()
  @ApiOperation({ summary: 'Create a new command' })
  create(
    @Body() createCommandDto: CreateCommandDto,
  ): Promise<JsonResponse<CommandDto>> {
    return this.commandsService.create(createCommandDto);
  }
}
