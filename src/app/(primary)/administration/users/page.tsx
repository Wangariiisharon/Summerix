'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="">
      <section className="flex justify-between gap-5">
        <div className="">
          <h2 className="font-bold">Users</h2>
          <p className="text-gray-500">Manage your teams & user permissions.</p>
        </div>
        <Link href="/administration/users/new" className="btn btn-secondary btn-flex">
          <PlusIcon className="h-4 w-4" />
          <p>Add User</p>
        </Link>
      </section>

      <p className="mt-5">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi eos neque laborum corporis
        dolore molestias. Modi unde in magnam neque corporis nam, rerum, optio aspernatur ipsam
        minima ad accusamus recusandae!
      </p>
    </main>
  );
}
