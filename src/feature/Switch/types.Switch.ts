export interface ISwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  'aria-label'?: string;
}
