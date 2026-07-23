export interface IDeleteItem {
  open: boolean;
  onClose: () => void;
  item: IItemToDelete;
  itemType: string;
  handler: () => Promise<void>;
  onCancel: () => void;
}

export interface IItemToDelete {
  id: number;
  name: string;
}
