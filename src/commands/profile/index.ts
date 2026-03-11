import type { CommandEx } from '../../schemas/command-ex';
import { CommandTemplate } from '../../schemas/command-template';
import { AddProfileCommandTemplate } from './add';
import { ListProfileCommandTemplate } from './list';
import { RemoveProfileCommandTemplate } from './remove';

export class ProfileCommandTemplate extends CommandTemplate {
  name = 'profile';

  setup(cmd: CommandEx) {
    cmd.alias('p').description('Manage Profiles');
  }

  setOptions(cmd: CommandEx) {
    return cmd;
  }

  setAction(cmd: CommandEx) {
    cmd.register(new AddProfileCommandTemplate()).register(new RemoveProfileCommandTemplate()).register(new ListProfileCommandTemplate());
  }
}
