import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { CardType } from '@/object-record/record-show/types/CardType';
import { type RecordLayout } from '@/object-record/record-show/types/RecordLayout';

export const COMPANY_RECORD_LAYOUT: RecordLayout = {
  tabs: {
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
    assistant: {
      title: 'Assistant',
      position: 50,
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
    emails: {
      title: 'Emails',
      position: 600,
      icon: 'IconMail',
      cards: [{ type: CardType.EmailCard }],
      hide: {
        ifMobile: false,
        ifDesktop: false,
        ifInRightDrawer: false,
        ifFeaturesDisabled: [],
        ifRequiredObjectsInactive: [],
        ifRelationsMissing: [],
      },
    },
    notes: null,
  },
};
