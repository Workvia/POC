import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { CardType } from '@/object-record/record-show/types/CardType';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';

export const COMPANY_RECORD_LAYOUT: RecordLayout = {
  tabs: {
    assistant: {
      title: 'Assistant',
      position: 150,
      icon: 'IconSparkles',
      cards: [{ type: CardType.AssistantCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
      },
    },
    workflows: {
      title: 'Workflows',
      position: 250,
      icon: 'IconSettingsAutomation',
      cards: [{ type: CardType.WorkflowsCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [CoreObjectNameSingular.Workflow],
        ifRelationsMissing: [],
      },
    },
    notes: null,
  },
};
