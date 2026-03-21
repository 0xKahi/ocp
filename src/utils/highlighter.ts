import kleur from 'kleur';

class Highlighter {
  component(text: string): string {
    return kleur.cyan(text);
  }

  path(text: string): string {
    return kleur.green(text);
  }

  command(text: string): string {
    return kleur.yellow(text);
  }

  url(text: string): string {
    return kleur.cyan().underline(text);
  }

  success(text: string): string {
    return kleur.bold(kleur.green(text));
  }

  error(text: string): string {
    return kleur.red(text);
  }

  profile(text: string): string {
    return kleur.bold(kleur.magenta(text));
  }
}

export const highlighter = new Proxy(new Highlighter(), {
  get(target, prop) {
    if (prop in target) {
      return target[prop as keyof Highlighter];
    }
    const kleurValue = kleur[prop as keyof typeof kleur];
    if (typeof kleurValue === 'function') {
      return kleurValue.bind(kleur);
    }
    return kleurValue;
  },
}) as Highlighter & typeof kleur;

// export { Highlighter };
