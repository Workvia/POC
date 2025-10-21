import { useParams, Navigate } from 'react-router-dom';

import { RecordShowActionMenu } from '@/action-menu/components/RecordShowActionMenu';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { PageLayoutDispatcher } from '@/object-record/record-show/components/PageLayoutDispatcher';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { PageHeaderToggleCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderToggleCommandMenuButton';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { RecordShowPageHeader } from '~/pages/object-record/RecordShowPageHeader';
import { RecordShowPageTitle } from '~/pages/object-record/RecordShowPageTitle';
import { AppPath } from 'twenty-shared/types';

// This is the ID of the Proposal Generation workflow from prefill-workflows.ts
const PROPOSAL_GENERATION_WORKFLOW_ID = '8b213cac-a68b-4ffe-817a-3ec994e9932d';

export const RecordShowPage = () => {
  const parameters = useParams<{
    objectNameSingular: string;
    objectRecordId: string;
  }>();

  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    parameters.objectNameSingular ?? '',
    parameters.objectRecordId ?? '',
  );

  // Redirect to custom Proposal Generation page if this is the Proposal Generation workflow
  if (
    objectNameSingular === 'workflow' &&
    objectRecordId === PROPOSAL_GENERATION_WORKFLOW_ID
  ) {
    return <Navigate to={AppPath.ProposalGenerationPage} replace />;
  }

  const recordShowComponentInstanceId =
    computeRecordShowComponentInstanceId(objectRecordId);

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={recordShowComponentInstanceId}
    >
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
      >
        <ActionMenuComponentInstanceContext.Provider
          value={{ instanceId: recordShowComponentInstanceId }}
        >
          <PageContainer>
            <RecordShowPageTitle
              objectNameSingular={objectNameSingular}
              objectRecordId={objectRecordId}
            />
            <RecordShowPageHeader
              objectNameSingular={objectNameSingular}
              objectRecordId={objectRecordId}
            >
              <RecordShowActionMenu />
              <PageHeaderToggleCommandMenuButton />
            </RecordShowPageHeader>
            <PageBody>
              <TimelineActivityContext.Provider
                value={{
                  recordId: objectRecordId,
                }}
              >
                <PageLayoutDispatcher
                  targetRecordIdentifier={{
                    id: objectRecordId,
                    targetObjectNameSingular: objectNameSingular,
                  }}
                />
              </TimelineActivityContext.Provider>
            </PageBody>
          </PageContainer>
        </ActionMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};
