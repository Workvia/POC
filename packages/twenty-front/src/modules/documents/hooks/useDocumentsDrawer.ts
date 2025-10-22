import { useRecoilState } from 'recoil';
import { documentsDrawerOpenState } from '../states/documentsDrawerOpenState';

export const useDocumentsDrawer = () => {
  const [isDocumentsDrawerOpen, setIsDocumentsDrawerOpen] = useRecoilState(
    documentsDrawerOpenState,
  );

  const openDocumentsDrawer = () => setIsDocumentsDrawerOpen(true);
  const closeDocumentsDrawer = () => setIsDocumentsDrawerOpen(false);
  const toggleDocumentsDrawer = () => setIsDocumentsDrawerOpen((prev) => !prev);

  return {
    isDocumentsDrawerOpen,
    openDocumentsDrawer,
    closeDocumentsDrawer,
    toggleDocumentsDrawer,
  };
};
