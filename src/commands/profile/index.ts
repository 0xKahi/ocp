import type { CommandEx } from '../../schemas/command-ex';
import { CommandTemplate } from '../../schemas/command-template';
import { AddProfileCommandTemplate } from './add';
import { ListProfileCommandTemplate } from './list';
import { RemoveProfileCommandTemplate } from './remove';

export class ProfileCommandTemplate extends CommandTemplate {
  override readonly name = 'profile';
  override readonly description = 'Manage Profiles';
  override readonly alias = 'p';

  override setOptions(_cmd: CommandEx): void {}

  override subCommands(): CommandTemplate[] {
    return [new AddProfileCommandTemplate(), new RemoveProfileCommandTemplate(), new ListProfileCommandTemplate()];
  }
}
