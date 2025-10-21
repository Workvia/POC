import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

// This is the ID of the Proposal Generation workflow from prefill-workflows.ts
const PROPOSAL_GENERATION_WORKFLOW_ID = '8b213cac-a68b-4ffe-817a-3ec994e9932d';

export const useWorkflowsIndexIdentifierClick = ({
  objectMetadataItem,
  recordIndexId,
}: {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const currentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
    recordIndexId,
  );

  const indexIdentifierUrl = (recordId: string) => {
    // If this is the Proposal Generation workflow, route to custom page
    if (recordId === PROPOSAL_GENERATION_WORKFLOW_ID) {
      return AppPath.ProposalGenerationPage;
    }

    // Otherwise, route to standard workflow show page
    return getAppPath(
      AppPath.RecordShowPage,
      {
        objectNameSingular: objectMetadataItem.nameSingular,
        objectRecordId: recordId,
      },
      {
        viewId: currentViewId,
      },
    );
  };

  return { indexIdentifierUrl };
};
