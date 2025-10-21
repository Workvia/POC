import styled from '@emotion/styled';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { Select } from '@/ui/input/components/Select';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Trans, useLingui } from '@lingui/react/macro';
import { AttachmentList } from '@/activities/files/components/AttachmentList';
import { DropZone } from '@/activities/files/components/DropZone';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(4)} 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledAttachmentsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;

  /* Remove horizontal padding from AttachmentList */
  & > div {
    padding-left: 0;
    padding-right: 0;
    width: 100%;
  }
`;

const StyledDropZoneContainer = styled.div`
  height: 100%;
`;

const StyledButton = styled(Button)`
  background: ${({ theme }) => theme.name === 'dark' ? '#FFFFFF' : '#000000'};
  color: ${({ theme }) => theme.name === 'dark' ? '#000000' : '#FFFFFF'};
  justify-content: center;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};

  &:hover {
    background: ${({ theme }) => theme.name === 'dark' ? '#F5F5F5' : '#1A1A1A'};
  }
`;

const StyledSelectWrapper = styled.div`
  /* Force dropdown to be full width */
  [data-select-disable] {
    width: 100% !important;
  }
`;

interface Company {
  id: string;
  name: string;
}

export const DetailsTab = () => {
  const { t } = useLingui();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const { records: companies } = useFindManyRecords<Company>({
    objectNameSingular: CoreObjectNameSingular.Company,
    orderBy: [{ name: 'AscNullsLast' }],
  });

  const companyOptions = (companies || []).map((company) => ({
    label: company.name,
    value: company.id,
  }));

  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [fileFormat, setFileFormat] = useState<string>('pdf');

  // Set initial company when companies load
  useEffect(() => {
    if (companyOptions.length > 0 && !selectedCompany) {
      setSelectedCompany(companyOptions[0].value);
    }
  }, [companyOptions, selectedCompany]);

  const targetRecord = {
    targetObjectNameSingular: CoreObjectNameSingular.Company,
    id: selectedCompany || 'placeholder',
  };

  const { uploadAttachmentFile } = useUploadAttachmentFile();

  // Always call the hook, but pass a placeholder ID if none selected
  const { attachments, loading } = useAttachments(targetRecord);

  const formatOptions = [
    { label: 'Word (.docx)', value: 'docx' },
    { label: 'PDF', value: 'pdf' },
  ];

  const onUploadFile = async (file: File) => {
    if (!selectedCompany) {
      console.error('No company selected');
      return;
    }
    await uploadAttachmentFile(file, targetRecord);
  };

  const onUploadFiles = async (files: File[]) => {
    for (const file of files) {
      await onUploadFile(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(e.target.files)) {
      onUploadFiles(Array.from(e.target.files));
    }
  };

  const handleUploadFileClick = () => {
    inputFileRef?.current?.click?.();
  };

  const isAttachmentsEmpty = !attachments || attachments.length === 0;

  if (!companies || companies.length === 0) {
    return (
      <StyledContainer>
        <p>Loading companies...</p>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledSection>
        {isAttachmentsEmpty ? (
          <StyledDropZoneContainer onDragEnter={() => setIsDraggingFile(true)}>
            {isDraggingFile ? (
              <DropZone
                setIsDraggingFile={setIsDraggingFile}
                onUploadFiles={onUploadFiles}
              />
            ) : (
              <AnimatedPlaceholderEmptyContainer
                {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
              >
                <AnimatedPlaceholderEmptyTextContainer>
                  <AnimatedPlaceholderEmptyTitle>
                    <Trans>Carrier Quotes</Trans>
                  </AnimatedPlaceholderEmptyTitle>
                  <AnimatedPlaceholderEmptySubTitle>
                    <Trans>PDF files only.</Trans>
                  </AnimatedPlaceholderEmptySubTitle>
                </AnimatedPlaceholderEmptyTextContainer>
                <StyledFileInput
                  ref={inputFileRef}
                  onChange={handleFileChange}
                  type="file"
                  accept="application/pdf"
                  multiple
                />
                <StyledButton
                  Icon={IconPlus}
                  title={t`Add file`}
                  variant="secondary"
                  onClick={handleUploadFileClick}
                  fullWidth
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
              accept="application/pdf"
              multiple
            />
            <AttachmentList
              targetableObject={targetRecord}
              title={t`Carrier Quotes`}
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
      </StyledSection>

      <StyledSection>
        <StyledLabel>Company</StyledLabel>
        <StyledSelectWrapper>
          <Select
            dropdownId="company-select"
            fullWidth
            dropdownWidthAuto
            value={selectedCompany}
            options={companyOptions}
            onChange={setSelectedCompany}
          />
        </StyledSelectWrapper>
      </StyledSection>

      <StyledSection>
        <StyledLabel>File Format</StyledLabel>
        <StyledSelectWrapper>
          <Select
            dropdownId="format-select"
            fullWidth
            dropdownWidthAuto
            value={fileFormat}
            options={formatOptions}
            onChange={setFileFormat}
          />
        </StyledSelectWrapper>
      </StyledSection>
    </StyledContainer>
  );
};
