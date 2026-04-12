import { type NoteOptions, note, outro } from '@clack/prompts';
import { highlighter } from './highlighter';

export function pointFormNote({ values, title, opts }: { values: string[]; title: string; opts?: NoteOptions }) {
  note(values.join('\n'), title, {
    ...opts,
    format: (line: string) => `• ${line}`,
  });
}

export function successOutro(message?: string) {
  outro(`${highlighter.green('✓')} ${message ?? 'Done'}`);
}
