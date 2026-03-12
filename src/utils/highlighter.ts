import kleur from 'kleur';

export const highlighter = {
  component: (text: string) => kleur.cyan(text),
  path: (text: string) => kleur.green(text),
  command: (text: string) => kleur.yellow(text),
  url: (text: string) => kleur.blue().underline(text),
  success: (text: string) => kleur.bold(kleur.green(text)),
  error: (text: string) => kleur.red(text),
  dim: (text: string) => kleur.gray(text),
  bold: (text: string) => kleur.bold(text),
  profile: (text: string) => kleur.bold(kleur.magenta(text)),
};
