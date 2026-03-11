import { Command } from 'commander';
import type { CommandTemplate } from './command-template';

export class CommandEx extends Command {
  register(template: CommandTemplate): this {
    return this.addCommand(template.build());
  }
}
