'use client';

import useCurrentCompany from '@/hooks/useCurrentCompany';
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
          <button className="btn btn-primary mt-5">Upload New Photo</button>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-5">
        {['profile', 'users', 'department'].map((item) => {
          return (
            <Link
              key={item}
              href={`/administration/${item}`}
              className={`btn capitalize ${pathName.endsWith(item) ? 'btn-primary' : 'btn-outline'}`}
            >
              {item}
            </Link>
          );
        })}
      </div>
    </Suspense>
  );
}
