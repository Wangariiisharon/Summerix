import { useAuthContext } from '@/app/auth-provider';
import {
  BriefcaseIcon,
  DocumentChartBarIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { useMemo } from 'react';

function useNavLinks() {
  const { authUser } = useAuthContext();

  const navigation = useMemo(
    () => [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
        visible: authUser && authUser.companyId,
      },
      {
        name: 'Administration',
        href: '/administration',
        icon: WrenchScrewdriverIcon,
        visible: authUser?.isOwner || authUser?.isAdmin || false,
        children: [
          { name: 'Overview', link: '' },
          { name: 'Profile', link: 'profile' },
          { name: 'Users', link: 'users' },
          { name: 'Departments', link: 'departments' },
        ],
      },
      {
        name: 'Reports',
        href: '/reports',
        icon: DocumentChartBarIcon,
        visible: authUser && authUser.companyId,
      },
      {
        name: 'Add Company',
        href: '/company-setup',
        icon: BriefcaseIcon,
        visible: authUser && !authUser.companyId,
      },
    ],
    [authUser],
  );

  return navigation;
}

export default useNavLinks;
