import { useRecoilState, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { invalidAvatarUrlsState } from 'twenty-ui/display';
import { ImageInput } from '@/ui/input/components/ImageInput';
import {
  useUpdateWorkspaceMutation,
  useUploadWorkspaceLogoMutation,
} from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { buildSignedPath } from 'twenty-shared/utils';

export const WorkspaceLogoUploader = () => {
  const [uploadLogo] = useUploadWorkspaceLogoMutation();
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const setInvalidAvatarUrls = useSetRecoilState(invalidAvatarUrlsState);

  const onUpload = async (file: File) => {
    if (isUndefinedOrNull(file)) {
      return;
    }
    if (!currentWorkspace?.id) {
      throw new Error('Workspace id not found');
    }
    await uploadLogo({
      variables: {
        file,
      },
      onCompleted: (data) => {
        const newLogoPath = buildSignedPath(data.uploadWorkspaceLogo);

        // Clear any invalid avatar URL cache to ensure new logo loads
        setInvalidAvatarUrls([]);

        setCurrentWorkspace({
          ...currentWorkspace,
          logo: newLogoPath,
        });

        // Force favicon refresh by adding timestamp
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (favicon) {
          const url = new URL(favicon.href, window.location.origin);
          url.searchParams.set('t', Date.now().toString());
          favicon.href = url.toString();
        }
      },
    });
  };

  const onRemove = async () => {
    if (!currentWorkspace?.id) {
      throw new Error('Workspace id not found');
    }
    await updateWorkspace({
      variables: {
        input: {
          logo: null,
        },
      },
      onCompleted: () => {
        setCurrentWorkspace({
          ...currentWorkspace,
          logo: null,
        });
      },
    });
  };

  return (
    <ImageInput
      picture={currentWorkspace?.logo}
      onUpload={onUpload}
      onRemove={onRemove}
    />
  );
};
