import { CommandEx } from './command-ex';

export abstract class CommandTemplate {
  abstract get name(): string;

  abstract setup(cmd: CommandEx): void;

  abstract setOptions(cmd: CommandEx): void;

  abstract setAction(cmd: CommandEx): void;

  build(): CommandEx {
    const cmd = new CommandEx(this.name);
    this.setup(cmd);
    this.setOptions(cmd);
    this.setAction(cmd);
    return cmd;
  }
}
