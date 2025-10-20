import styled from '@emotion/styled';
import { type ChangeEvent, useRef, useState } from 'react';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { IconFileText, IconPlus, IconBuildingSkyscraper } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { AttachmentList } from '@/activities/files/components/AttachmentList';
import { DropZone } from '@/activities/files/components/DropZone';
import { type Attachment } from '@/activities/files/types/Attachment';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Select } from '@/ui/input/components/Select';
import type { SelectOption } from 'twenty-ui/input';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledPageBody = styled(PageBody)`
  display: flex;
  flex-direction: column;
`;

const StyledAttachmentsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledDropZoneContainer = styled.div`
  height: 100%;
`;

const StyledConfirmationModal = styled(Modal)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  width: calc(400px - ${({ theme }) => theme.spacing(32)});
  height: auto;
`;

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledCenteredButton = styled(Button)`
  box-sizing: border-box;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledSelectSection = styled(Section)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const MODAL_ID = 'company-selection-modal';

interface Company {
  id: string;
  name: string;
}

export const Documents = () => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const { t } = useLingui();
  const { openModal, closeModal } = useModal();

  // Fetch ALL attachments without filtering by target
  const { records: attachments, loading, refetch } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    orderBy: [
      {
        createdAt: 'DescNullsFirst',
      },
    ],
  });

  // Fetch all companies for the dropdown
  const { records: companies } = useFindManyRecords<Company>({
    objectNameSingular: CoreObjectNameSingular.Company,
    orderBy: [
      {
        name: 'AscNullsLast',
      },
    ],
  });

  const { uploadAttachmentFile } = useUploadAttachmentFile();

  const companyOptions: SelectOption<string>[] = (companies || []).map((company) => ({
    label: company.name,
    value: company.id,
    Icon: IconBuildingSkyscraper,
  }));

  const onUploadFile = async (file: File, companyId: string) => {
    try {
      const target = {
        targetObjectNameSingular: CoreObjectNameSingular.Company,
        id: companyId,
      };
      await uploadAttachmentFile(file, target);
      await refetch();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const onUploadFiles = async (files: File[], companyId: string) => {
    for (const file of files) {
      await onUploadFile(file, companyId);
    }
  };

  // Handle file selection (after company is chosen)
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(e.target.files) && selectedCompanyId) {
      const files = Array.from(e.target.files);
      await onUploadFiles(files, selectedCompanyId);
      setSelectedCompanyId(null);
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
    }
  };

  // Step 1: User clicks "Add file" button - open modal to select company
  const handleUploadFileClick = () => {
    openModal(MODAL_ID);
  };

  // Step 2: User selects company and clicks "Continue" - open file picker
  const handleContinueWithCompany = () => {
    if (selectedCompanyId) {
      closeModal(MODAL_ID);
      // Trigger file picker after modal closes
      setTimeout(() => {
        inputFileRef?.current?.click?.();
      }, 100);
    }
  };

  const handleCancelCompanySelection = () => {
    setSelectedCompanyId(null);
    closeModal(MODAL_ID);
  };

  const isAttachmentsEmpty = !attachments || attachments.length === 0;

  if (loading && isAttachmentsEmpty) {
    return (
      <PageContainer>
        <PageHeader title="Documents" Icon={IconFileText} />
        <StyledPageBody>
          <SkeletonLoader />
        </StyledPageBody>
      </PageContainer>
    );
  }

  // For drag-drop, we need to temporarily store files and show modal
  const [dragDropPendingFiles, setDragDropPendingFiles] = useState<File[]>([]);

  const handleDragDropFiles = async (files: File[]) => {
    setDragDropPendingFiles(files);
    openModal(MODAL_ID);
  };

  // Handle continue after company selected in drag-drop scenario
  const handleContinueWithCompanyDragDrop = async () => {
    if (selectedCompanyId && dragDropPendingFiles.length > 0) {
      await onUploadFiles(dragDropPendingFiles, selectedCompanyId);
      setDragDropPendingFiles([]);
      setSelectedCompanyId(null);
      closeModal(MODAL_ID);
    } else if (selectedCompanyId) {
      // No pending files, proceed to file picker
      handleContinueWithCompany();
    }
  };

  if (isAttachmentsEmpty) {
    return (
      <>
        <PageContainer>
          <PageHeader title="Documents" Icon={IconFileText} />
          <StyledPageBody>
            <StyledDropZoneContainer onDragEnter={() => setIsDraggingFile(true)}>
              {isDraggingFile ? (
                <DropZone
                  setIsDraggingFile={setIsDraggingFile}
                  onUploadFiles={handleDragDropFiles}
                />
              ) : (
                <AnimatedPlaceholderEmptyContainer
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
                >
                  <AnimatedPlaceholder type="noFile" />
                  <AnimatedPlaceholderEmptyTextContainer>
                    <AnimatedPlaceholderEmptyTitle>
                      <Trans>No Documents</Trans>
                    </AnimatedPlaceholderEmptyTitle>
                    <AnimatedPlaceholderEmptySubTitle>
                      <Trans>Upload your first document to get started.</Trans>
                    </AnimatedPlaceholderEmptySubTitle>
                  </AnimatedPlaceholderEmptyTextContainer>
                  <StyledFileInput
                    ref={inputFileRef}
                    onChange={handleFileChange}
                    type="file"
                    multiple
                  />
                  <Button
                    Icon={IconPlus}
                    title={t`Add file`}
                    variant="secondary"
                    onClick={handleUploadFileClick}
                  />
                </AnimatedPlaceholderEmptyContainer>
              )}
            </StyledDropZoneContainer>
          </StyledPageBody>
        </PageContainer>

        <StyledConfirmationModal
          modalId={MODAL_ID}
          onClose={handleCancelCompanySelection}
          isClosable={true}
          padding="large"
          dataGloballyPreventClickOutside
        >
          <StyledCenteredTitle>
            <H1Title title={t`Select Company`} fontColor={H1TitleFontColor.Primary} />
          </StyledCenteredTitle>
          <StyledSelectSection>
            <Select
              dropdownId={`${MODAL_ID}-company-select`}
              fullWidth
              value={selectedCompanyId || undefined}
              options={companyOptions}
              onChange={(value) => setSelectedCompanyId(value)}
              withSearchInput
            />
          </StyledSelectSection>
          <StyledCenteredButton
            onClick={handleContinueWithCompanyDragDrop}
            variant="primary"
            title={t`Continue`}
            disabled={!selectedCompanyId}
            fullWidth
          />
        </StyledConfirmationModal>
      </>
    );
  }

  return (
    <>
      <PageContainer>
        <PageHeader title="Documents" Icon={IconFileText} />
        <StyledPageBody>
          <StyledAttachmentsContainer>
            <StyledFileInput
              ref={inputFileRef}
              onChange={handleFileChange}
              type="file"
              multiple
            />
            <AttachmentList
              targetableObject={{
                targetObjectNameSingular: CoreObjectNameSingular.Company,
                id: '',
              }}
              title={t`All Documents`}
              attachments={attachments ?? []}
              button={
                <Button
                  Icon={IconPlus}
                  size="small"
                  variant="secondary"
                  title={t`Add file`}
                  onClick={handleUploadFileClick}
                />
              }
            />
          </StyledAttachmentsContainer>
        </StyledPageBody>
      </PageContainer>

      <StyledConfirmationModal
        modalId={MODAL_ID}
        onClose={handleCancelCompanySelection}
        isClosable={true}
        padding="large"
        dataGloballyPreventClickOutside
      >
        <StyledCenteredTitle>
          <H1Title title={t`Select Company`} fontColor={H1TitleFontColor.Primary} />
        </StyledCenteredTitle>
        <StyledSelectSection>
          <Select
            dropdownId={`${MODAL_ID}-company-select`}
            fullWidth
            value={selectedCompanyId || undefined}
            options={companyOptions}
            onChange={(value) => setSelectedCompanyId(value)}
            withSearchInput
          />
        </StyledSelectSection>
        <StyledCenteredButton
          onClick={handleContinueWithCompanyDragDrop}
          variant="primary"
          title={t`Continue`}
          disabled={!selectedCompanyId}
          fullWidth
        />
      </StyledConfirmationModal>
    </>
  );
};
