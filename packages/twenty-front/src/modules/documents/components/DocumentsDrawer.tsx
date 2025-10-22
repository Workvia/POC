import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { type ChangeEvent, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import { IconFileText, IconPlus, IconBuildingSkyscraper, IconX, IconArrowUpRight } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
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
import { useDocumentsDrawer } from '../hooks/useDocumentsDrawer';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';

const StyledDrawerContainer = styled(motion.div)`
  background: ${({ theme }) => theme.background.primary};
  border-right: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  font-family: ${({ theme }) => theme.font.family};
  height: 100%;
  overflow: hidden;
  padding: 0;
  position: absolute;
  left: 0;
  top: 0;
  z-index: ${RootStackingContextZIndices.CommandMenu};
  display: flex;
  flex-direction: column;
  width: 460px;
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(4)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  flex-shrink: 0;
`;

const StyledHeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const StyledAttachmentsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(4)} 0;
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledDropZoneContainer = styled.div`
  height: 100%;
  padding: ${({ theme }) => theme.spacing(4)} 0;
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

const MODAL_ID = 'company-selection-modal-drawer';

interface Company {
  id: string;
  name: string;
}

const DRAWER_ANIMATION_VARIANTS = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
};

export const DocumentsDrawer = () => {
  const { isDocumentsDrawerOpen, closeDocumentsDrawer } = useDocumentsDrawer();
  const drawerRef = useRef<HTMLDivElement>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const { t } = useLingui();
  const { openModal, closeModal } = useModal();
  const theme = useTheme();

  // Fetch ALL attachments
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

  const handleUploadFileClick = () => {
    openModal(MODAL_ID);
  };

  const handleContinueWithCompany = () => {
    if (selectedCompanyId) {
      closeModal(MODAL_ID);
      setTimeout(() => {
        inputFileRef?.current?.click?.();
      }, 100);
    }
  };

  const handleCancelCompanySelection = () => {
    setSelectedCompanyId(null);
    closeModal(MODAL_ID);
  };

  const [dragDropPendingFiles, setDragDropPendingFiles] = useState<File[]>([]);

  const handleDragDropFiles = async (files: File[]) => {
    setDragDropPendingFiles(files);
    openModal(MODAL_ID);
  };

  const handleContinueWithCompanyDragDrop = async () => {
    if (selectedCompanyId && dragDropPendingFiles.length > 0) {
      await onUploadFiles(dragDropPendingFiles, selectedCompanyId);
      setDragDropPendingFiles([]);
      setSelectedCompanyId(null);
      closeModal(MODAL_ID);
    } else if (selectedCompanyId) {
      handleContinueWithCompany();
    }
  };

  const isAttachmentsEmpty = !attachments || attachments.length === 0;

  return (
    <>
      <AnimatePresence>
        {isDocumentsDrawerOpen && (
          <StyledDrawerContainer
            ref={drawerRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={DRAWER_ANIMATION_VARIANTS}
            transition={{ duration: theme.animation.duration.normal }}
          >
            <StyledHeader>
              <StyledHeaderTitle>
                <IconFileText size={theme.icon.size.md} />
                {t`Documents`}
              </StyledHeaderTitle>
              <IconButton
                Icon={IconX}
                size="small"
                variant="tertiary"
                onClick={closeDocumentsDrawer}
              />
            </StyledHeader>

            <StyledBody>
              {loading && isAttachmentsEmpty ? (
                <StyledAttachmentsContainer>
                  <SkeletonLoader />
                </StyledAttachmentsContainer>
              ) : isAttachmentsEmpty ? (
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
              ) : (
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
              )}
            </StyledBody>

            <RightDrawerFooter
              actions={[
                <Button
                  key="open"
                  Icon={IconArrowUpRight}
                  title={t`Open`}
                  variant="secondary"
                  accent="default"
                  onClick={() => window.open('/documents', '_blank')}
                />,
              ]}
            />
          </StyledDrawerContainer>
        )}
      </AnimatePresence>

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
