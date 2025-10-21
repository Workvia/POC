import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateObjectMetadataMaps } from 'src/engine/metadata-modules/utils/generate-object-metadata-maps.util';
import { generateObjectRecordFields } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-object-record-fields';

const PROPOSAL_GENERATION_WORKFLOW_ID = '8b213cac-a68b-4ffe-817a-3ec994e9932d';
const PROPOSAL_GENERATION_WORKFLOW_VERSION_ID = 'ac67974f-c524-4288-9d88-af8515400b68';

export const prefillWorkflows = async (
  entityManager: EntityManager,
  schemaName: string,
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const objectMetadataMaps = generateObjectMetadataMaps(objectMetadataItems);
  const companyObjectMetadataId =
    objectMetadataMaps.idByNameSingular['company'];

  const personObjectMetadataId = objectMetadataMaps.idByNameSingular['person'];

  if (
    !isDefined(companyObjectMetadataId) ||
    !isDefined(personObjectMetadataId)
  ) {
    throw new Error('Company or person object metadata not found');
  }

  const companyObjectMetadata =
    objectMetadataMaps.byId[companyObjectMetadataId];

  const personObjectMetadata = objectMetadataMaps.byId[personObjectMetadataId];

  if (!isDefined(companyObjectMetadata) || !isDefined(personObjectMetadata)) {
    throw new Error('Company or person object metadata not found');
  }

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.workflow`, [
      'id',
      'name',
      'lastPublishedVersionId',
      'statuses',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'createdByContext',
    ])
    .orIgnore()
    .values([
      {
        id: PROPOSAL_GENERATION_WORKFLOW_ID,
        name: 'Proposal Generation',
        lastPublishedVersionId: PROPOSAL_GENERATION_WORKFLOW_VERSION_ID,
        statuses: ['ACTIVE'],
        position: 1,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        createdByContext: {},
      },
    ])
    .returning('*')
    .execute();

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.workflowVersion`, [
      'id',
      'name',
      'trigger',
      'steps',
      'status',
      'position',
      'workflowId',
    ])
    .orIgnore()
    .values([
      {
        id: PROPOSAL_GENERATION_WORKFLOW_VERSION_ID,
        name: 'v1',
        trigger: JSON.stringify({
          name: 'Launch manually',
          type: 'MANUAL',
          settings: {
            outputSchema: {},
            icon: 'IconFileText',
            availability: { type: 'GLOBAL', locations: undefined },
          },
          nextStepIds: [],
        }),
        steps: JSON.stringify([]),
        status: 'ACTIVE',
        position: 1,
        workflowId: PROPOSAL_GENERATION_WORKFLOW_ID,
      },
    ])
    .returning('*')
    .execute();
};
