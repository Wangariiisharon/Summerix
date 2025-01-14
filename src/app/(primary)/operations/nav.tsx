'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';

export default function OperationsNav() {
  const pathName = usePathname();

  return (
    <Suspense fallback="Loading...">
      <div className="mt-5 flex items-center gap-5 overflow-auto">
        {[
          { name: 'Overview', link: '' },
          { name: 'Trips', link: 'trips' },
          { name: 'Vehicles', link: 'vehicles' },
          { name: 'Expenses', link: 'expenses' },
          { name: 'Classes', link: 'classes' },
          { name: 'Clients', link: 'clients' },
          { name: 'Drivers', link: 'drivers' },
          { name: 'Maintenance', link: 'maintenance' },
          { name: 'Suppliers', link: 'suppliers' },
        ].map(({ name, link }) => {
          const isActive =
            (pathName.startsWith(`/operations/${link}`) && name !== 'Overview') ||
            (pathName === '/operations' && name === 'Overview');

          return (
            <Link
              key={link}
              href={`/operations/${link}`}
              className={`px-4 py-2 text-sm capitalize hover:bg-primary/10 ${isActive && 'bg-primary/10 text-primary'}`}
            >
              {name}
            </Link>
          );
        })}
      </div>
    </Suspense>
  );
}
