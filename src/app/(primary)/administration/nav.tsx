'use client';

import useCurrentCompany from '@/hooks/useCurrentCompany';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import UploadPhotoButton from './button-upload';

export default function CompanyNav() {
  const { company } = useCurrentCompany();
  const pathName = usePathname();

  if (!company) return <></>;

  return (
    <Suspense fallback="Loading...">
      <div className="flex items-center gap-5">
        <Image
          src={company.photoURL}
          alt={company.name}
          className="w-40 rounded"
          width={500}
          height={500}
        />
        <div className="grid gap-1">
          <h2 className="font-semibold">{company.name}</h2>
          <p className="text-gray-500">{company.description}</p>
          <UploadPhotoButton company={company} />
        </div>
      </div>

      <div className="mt-10 flex items-center gap-5 overflow-auto">
        {[
          // { name: 'Overview', link: '' },
          { name: 'Profile', link: 'profile' },
          { name: 'Users', link: 'users' },
          { name: 'Departments', link: 'departments' },
          { name: 'Integration', link: 'integration' },
        ].map(({ name, link }) => {
          const isActive =
            (pathName.startsWith(`/administration/${link}`) && name !== 'Overview') ||
            (pathName === '/administration' && name === 'Overview');

          return (
            <Link
              key={link}
              href={`/administration/${link}`}
              className={`px-4 py-2 text-sm capitalize hover:bg-gray-200 ${isActive && 'bg-[#F9F9FB] text-[#256DDC]'}`}
            >
              {name}
            </Link>
          );
        })}
      </div>

      <hr className="my-3" />
    </Suspense>
  );
}
