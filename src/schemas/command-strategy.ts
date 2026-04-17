import { GlobalHelpConfig } from '../constants/global-help-config.const';
import { logger } from '../utils/logger';
import type { CommandEx } from './command-ex';

export interface CommandConfig {
  name: string;
  description: string;
  alias?: string;
  version?: string;
  args?: { name: string; description: string }[];
  options?: { flag: string; description: string }[];
  subCommands?: CommandStrategy[];
}

export interface CommandStrategy {
  readonly config: CommandConfig;
  execute?(...args: unknown[]): Promise<void> | void;
}

export class CommandLoader {
  private readonly loaded = new WeakSet<CommandStrategy>();

  load(strategy: CommandStrategy, cmd: CommandEx): void {
    if (this.loaded.has(strategy)) {
      throw new Error(`Command strategy "${strategy.config.name}" has already been loaded. Use a new instance.`);
    }
    this.loaded.add(strategy);

    cmd.configureHelp(GlobalHelpConfig);
    cmd.description(strategy.config.description);

    if (strategy.config.alias) {
      cmd.alias(strategy.config.alias);
    }

    if (strategy.config.version) {
      cmd.version(strategy.config.version);
    }

    for (const arg of strategy.config.args ?? []) {
      cmd.argument(arg.name, arg.description);
    }

    for (const opt of strategy.config.options ?? []) {
      cmd.option(opt.flag, opt.description);
    }

    if (strategy.execute) {
      cmd.action(this.wrapAction(strategy.execute.bind(strategy)));
    }

    for (const sub of strategy.config.subCommands ?? []) {
      cmd.register(sub);
    }
  }

  private wrapAction(handler: (...args: unknown[]) => Promise<void> | void): (...args: unknown[]) => Promise<void> {
    return async (...args: unknown[]) => {
      try {
        await handler(...args);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(message || 'An unexpected error occurred');
        process.exit(1);
      }
    };
  }
}

export const commandLoader = new CommandLoader();
