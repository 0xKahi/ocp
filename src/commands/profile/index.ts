import type { CommandStrategy } from '../../schemas/command-strategy';
import { AddProfileCommand } from './add';
import { ListProfileCommand } from './list';
import { RemoveProfileCommand } from './remove';

export class ProfileCommand implements CommandStrategy {
  readonly config = {
    name: 'profile',
    description: 'Manage Profiles',
    alias: 'p',
    subCommands: [new AddProfileCommand(), new RemoveProfileCommand(), new ListProfileCommand()],
  };
}
