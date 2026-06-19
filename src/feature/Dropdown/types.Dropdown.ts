export interface IDropdownProps {
  options: IDropdownOption[];
  target: React.MouseEvent<HTMLButtonElement, MouseEvent>;
}

export interface IDropdownOption {
  callback: () => void;
  name: string;
}
