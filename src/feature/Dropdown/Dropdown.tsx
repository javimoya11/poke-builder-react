import { DropdownOption } from './DropdownOption';
import { IDropdownProps } from './types.Dropdown';

export const Dropdown = (props: IDropdownProps) => {
  return (
    <div>
      {props.options.map((opt, index) => (
        <DropdownOption {...opt} key={`${opt.name}-${index}`} />
      ))}
    </div>
  );
};
