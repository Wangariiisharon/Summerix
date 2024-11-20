'use client';

import useCurrentCompany from '@/hooks/useCurrentCompany';
import { CameraIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

export default function CompanyView() {
  const { company } = useCurrentCompany();
  const pathName = usePathname();

  if (!company) return;

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
          <button className="btn btn-flex btn-secondary mt-5 px-8">
            <CameraIcon className="h-5 w-5" />
            <p>Upload New Photo</p>
          </button>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-5">
        {[
          { name: 'Overview', link: '' },
          { name: 'Profile', link: 'profile' },
          { name: 'Users', link: 'users' },
          { name: 'Departments', link: 'departments' },
          { name: 'Integration', link: 'integration' },
        ].map(({ name, link }) => {
          const isActive =
            (pathName.endsWith(link) && name !== 'Overview') ||
            (pathName === '/administration' && name === 'Overview');

          return (
            <Link
              key={link}
              href={`/administration/${link}`}
              className={`px-4 py-2 text-sm capitalize hover:bg-gray-200 ${isActive && 'bg-gray-200 text-primary'}`}
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
