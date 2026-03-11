import kleur from 'kleur';

export const logger = {
  info(...args: unknown[]): void {
    console.log(kleur.blue('info'), ...args);
  },

  success(...args: unknown[]): void {
    console.log(kleur.green('✓'), ...args);
  },

  warn(...args: unknown[]): void {
    console.warn(kleur.yellow('warn'), ...args);
  },

  error(...args: unknown[]): void {
    console.error(kleur.red('error'), ...args);
  },

  debug(...args: unknown[]): void {
    console.log(kleur.magenta('debug'), ...args);
  },

  message(...args: unknown[]): void {
    console.log(...args);
  },

  /** Print a blank line */
  break(): void {
    console.log('');
  },
};
