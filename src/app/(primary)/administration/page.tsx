'use client';

import { useAuthContext } from '@/app/auth-provider';
import useCurrentCompany from '@/hooks/useCurrentCompany';
import Link from 'next/link';

export default function Administration() {
  const { authUser } = useAuthContext();
  const { company } = useCurrentCompany();
  console.debug('company:', company);

  return (
    <main className="">
      <h2 className="font-bold">Administration</h2>
      <p className="mt-5">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi eos neque laborum corporis
        dolore molestias. Modi unde in magnam neque corporis nam, rerum, optio aspernatur ipsam
        minima ad accusamus recusandae!
      </p>

      <section className="mt-10">
        {authUser && !authUser.companyId && (
          <Link href="/administration/company" className="btn btn-primary">
            Add New Company
          </Link>
        )}
      </section>
    </main>
  );
}
