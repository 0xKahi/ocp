import { Command } from 'commander';
import type { CommandStrategy } from './command-strategy';
import { commandLoader } from './command-strategy';

export class CommandEx extends Command {
  private static assertNoDuplicateEntry(existingEntries: Set<string>, entry: string, parentName: string): void {
    if (existingEntries.has(entry)) {
      throw new Error(`Command entry "${entry}" is already registered on "${parentName}".`);
    }
  }

  private static assertUniqueAlias(cmd: Command): void {
    const aliases = cmd.aliases();
    const aliasSet = new Set(aliases);
    if (aliasSet.size !== aliases.length) {
      throw new Error(`Command "${cmd.name()}" has duplicate aliases.`);
    }
  }

  private static collectEntries(strategy: CommandStrategy): string[] {
    const entries = [strategy.config.name];
    if (strategy.config.alias) {
      entries.push(strategy.config.alias);
    }
    return entries;
  }

  use(strategy: CommandStrategy): this {
    const currentName = this.name();
    if (currentName && currentName !== strategy.config.name) {
      throw new Error(`Cannot apply strategy "${strategy.config.name}" to command "${currentName}".`);
    }

    if (!currentName) {
      this.name(strategy.config.name);
    }

    const existingEntries = this.commands.flatMap(command => [command.name(), ...command.aliases()]);
    const existingEntrySet = new Set(existingEntries);
    const parentName = this.name() || 'root';

    for (const entry of CommandEx.collectEntries(strategy)) {
      CommandEx.assertNoDuplicateEntry(existingEntrySet, entry, parentName);
    }

    commandLoader.load(strategy, this);
    return this;
  }

  register(strategy: CommandStrategy): this {
    const existingEntries = this.commands.flatMap(command => [command.name(), ...command.aliases()]);
    const existingEntrySet = new Set(existingEntries);
    const parentName = this.name() || 'root';

    for (const entry of CommandEx.collectEntries(strategy)) {
      CommandEx.assertNoDuplicateEntry(existingEntrySet, entry, parentName);
    }

    const command = new CommandEx(strategy.config.name);
    commandLoader.load(strategy, command);
    CommandEx.assertUniqueAlias(command);

    const newEntries = [command.name(), ...command.aliases()];
    for (const entry of newEntries) {
      CommandEx.assertNoDuplicateEntry(existingEntrySet, entry, parentName);
    }

    return this.addCommand(command);
  }
}
