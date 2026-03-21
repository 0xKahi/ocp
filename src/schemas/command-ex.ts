import { Command } from 'commander';
import type { CommandTemplate } from './command-template';

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

  private static collectEntries(template: CommandTemplate): string[] {
    const entries = [template.name];
    if (template.alias) {
      entries.push(template.alias);
    }
    return entries;
  }

  use(template: CommandTemplate): this {
    const currentName = this.name();
    if (currentName && currentName !== template.name) {
      throw new Error(`Cannot apply template "${template.name}" to command "${currentName}".`);
    }

    if (!currentName) {
      this.name(template.name);
    }

    const existingEntries = this.commands.flatMap(command => [command.name(), ...command.aliases()]);
    const existingEntrySet = new Set(existingEntries);
    const parentName = this.name() || 'root';

    for (const entry of CommandEx.collectEntries(template)) {
      CommandEx.assertNoDuplicateEntry(existingEntrySet, entry, parentName);
    }

    template.load(this);
    return this;
  }

  register(template: CommandTemplate): this {
    const existingEntries = this.commands.flatMap(command => [command.name(), ...command.aliases()]);
    const existingEntrySet = new Set(existingEntries);
    const parentName = this.name() || 'root';

    for (const entry of CommandEx.collectEntries(template)) {
      CommandEx.assertNoDuplicateEntry(existingEntrySet, entry, parentName);
    }

    const command = new CommandEx(template.name);
    template.load(command);
    CommandEx.assertUniqueAlias(command);

    const newEntries = [command.name(), ...command.aliases()];
    for (const entry of newEntries) {
      CommandEx.assertNoDuplicateEntry(existingEntrySet, entry, parentName);
    }

    return this.addCommand(command);
  }
}
