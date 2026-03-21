import { GlobalHelpConfig } from '../constants/global-help-config.const';
import { logger } from '../utils/logger';
import { CommandEx } from './command-ex';

export abstract class CommandTemplate {
  abstract readonly name: string;

  abstract readonly description: string;

  readonly alias?: string;

  private hasBuilt = false;

  setArguments(_cmd: CommandEx): void {}

  setOptions(_cmd: CommandEx): void {}

  subCommands(): CommandTemplate[] {
    return [];
  }

  execute(..._args: unknown[]): Promise<void> | void {}

  globalSettings(cmd: CommandEx): void {
    cmd.configureHelp(GlobalHelpConfig);
  }

  protected wrapAction<TArgs extends unknown[]>(handler: (...args: TArgs) => Promise<void> | void): (...args: TArgs) => Promise<void> {
    return async (...args: TArgs) => {
      try {
        await handler(...args);
      } catch (error: unknown) {
        this.handleError(error);
      }
    };
  }

  protected handleError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(message || 'An unexpected error occurred');
    process.exit(1);
  }

  load(cmd: CommandEx): CommandEx {
    if (this.hasBuilt) {
      throw new Error(`Command template "${this.name}" has already been built. Create a new template instance before registering again.`);
    }

    this.globalSettings(cmd);
    cmd.description(this.description);

    if (this.alias) {
      cmd.alias(this.alias);
    }

    this.setArguments(cmd);
    this.setOptions(cmd);
    for (const subCommand of this.subCommands()) {
      cmd.register(subCommand);
    }

    if (this.execute !== CommandTemplate.prototype.execute) {
      cmd.action(this.wrapAction(this.execute.bind(this)));
    }

    this.hasBuilt = true;
    return cmd;
  }
}
