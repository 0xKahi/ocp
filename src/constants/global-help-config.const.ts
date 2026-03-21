import type { HelpConfiguration } from 'commander';
import { highlighter } from '../utils/highlighter';

export const GlobalHelpConfig: HelpConfiguration = {
  styleTitle: str => highlighter.bold(str),
  styleCommandText: str => highlighter.green(str),
  styleCommandDescription: str => highlighter.cyan().bold(str),
  styleOptionText: str => highlighter.white(str),
  styleArgumentText: str => highlighter.yellow(str),
  styleSubcommandText: str => highlighter.green(str),
};
