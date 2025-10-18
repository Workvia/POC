import { NavigationDrawerItemForObjectMetadataItem } from '@/object-metadata/components/NavigationDrawerItemForObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { IconAssistant } from '@/ui/display/icon/components/IconAssistant';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

const ORDERED_STANDARD_OBJECTS: string[] = [
  CoreObjectNameSingular.Person,
  CoreObjectNameSingular.Company,
  CoreObjectNameSingular.Task,
  CoreObjectNameSingular.Note,
];

type NavigationDrawerSectionForObjectMetadataItemsProps = {
  sectionTitle: string;
  isRemote: boolean;
  objectMetadataItems: ObjectMetadataItem[];
};

export const NavigationDrawerSectionForObjectMetadataItems = ({
  sectionTitle,
  isRemote,
  objectMetadataItems,
}: NavigationDrawerSectionForObjectMetadataItemsProps) => {
  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Objects' + (isRemote ? 'Remote' : 'Workspace'));
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);
  const { t } = useLingui();
  const location = useLocation();
  const currentPath = location.pathname;

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const sortedStandardObjectMetadataItems = [...objectMetadataItems]
    .filter((item) => ORDERED_STANDARD_OBJECTS.includes(item.nameSingular))
    .sort((objectMetadataItemA, objectMetadataItemB) => {
      const indexA = ORDERED_STANDARD_OBJECTS.indexOf(
        objectMetadataItemA.nameSingular,
      );
      const indexB = ORDERED_STANDARD_OBJECTS.indexOf(
        objectMetadataItemB.nameSingular,
      );
      if (indexA === -1 || indexB === -1) {
        return objectMetadataItemA.nameSingular.localeCompare(
          objectMetadataItemB.nameSingular,
        );
      }
      return indexA - indexB;
    });

  const sortedCustomObjectMetadataItems = [...objectMetadataItems]
    .filter((item) => !ORDERED_STANDARD_OBJECTS.includes(item.nameSingular))
    .sort((objectMetadataItemA, objectMetadataItemB) => {
      return new Date(objectMetadataItemA.createdAt) <
        new Date(objectMetadataItemB.createdAt)
        ? 1
        : -1;
    });

  const objectMetadataItemsForNavigationItems = [
    ...sortedStandardObjectMetadataItems,
    ...sortedCustomObjectMetadataItems,
  ];

  const objectMetadataItemsForNavigationItemsWithReadPermission =
    objectMetadataItemsForNavigationItems.filter(
      (objectMetadataItem) =>
        getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          objectMetadataItem.id,
        ).canReadObjectRecords,
    );

  return (
    objectMetadataItems.length > 0 && (
      <NavigationDrawerSection>
        <NavigationDrawerAnimatedCollapseWrapper>
          <NavigationDrawerSectionTitle
            label={sectionTitle}
            onClick={() => toggleNavigationSection()}
          />
        </NavigationDrawerAnimatedCollapseWrapper>
        {isNavigationSectionOpen &&
          objectMetadataItemsForNavigationItemsWithReadPermission.map(
            (objectMetadataItem, index) => {
              const items = [];

              // Render the current object metadata item
              items.push(
                <NavigationDrawerItemForObjectMetadataItem
                  key={`navigation-drawer-item-${objectMetadataItem.id}`}
                  objectMetadataItem={objectMetadataItem}
                />
              );

              // If this is the Company item and we're in the Workspace section (not Remote),
              // inject the Assistant item right after it
              if (
                !isRemote &&
                objectMetadataItem.nameSingular === CoreObjectNameSingular.Company
              ) {
                const isAssistantActive = currentPath === AppPath.AssistantPage;
                items.push(
                  <NavigationDrawerItem
                    key="navigation-drawer-item-assistant"
                    label={t`Assistant`}
                    Icon={IconAssistant}
                    to={AppPath.AssistantPage}
                    active={isAssistantActive}
                  />
                );
              }

              return items;
            },
          )}
      </NavigationDrawerSection>
    )
  );
};
