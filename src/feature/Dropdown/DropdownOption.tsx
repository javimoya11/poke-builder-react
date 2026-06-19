import { IDropdownOption } from './types.Dropdown';

export const DropdownOption = (props: IDropdownOption) => {
  return <button onClick={props.callback}></button>;
};
