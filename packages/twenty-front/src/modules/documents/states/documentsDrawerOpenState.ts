import { createState } from 'twenty-ui/utilities';

export const documentsDrawerOpenState = createState<boolean>({
  key: 'documentsDrawerOpenState',
  defaultValue: false,
});
