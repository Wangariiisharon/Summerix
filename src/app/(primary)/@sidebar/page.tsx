'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import useNavLinks from '@/hooks/useNavLinks';

export default function Sidebar() {
  const navigation = useNavLinks();
  const pathName = usePathname();

  return (
    <>
      <div className="hidden flex-col xl:flex">
        {navigation
          .filter((i) => i.visible)
          .map(({ name, href, icon: ItemIcon, children }, index) => {
            const isActive = pathName.startsWith(href);

            return (
              <div key={`${href}-${index}`}>
                <>
                  <Link href={href}>
                    <div
                      className={`flex cursor-pointer justify-center border-r-4 hover:bg-blue-100 ${
                        isActive ? 'border-blue-500 bg-blue-100' : 'border-transparent'
                      }`}
                    >
                      <div className="flex w-full items-center justify-start px-4">
                        <ItemIcon
                          className={`h-7 w-7 ${isActive ? 'text-blue-500' : 'text-gray-500'}`}
                        />
                        <span
                          className={`p-4 font-medium ${isActive ? 'text-primary' : 'text-gray-700'}`}
                        >
                          {name}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {isActive && children && (
                    <div className="grid gap-2 p-4">
                      {children.map((item) => {
                        const isActive =
                          (pathName.startsWith(`${href}/${item.link}`) &&
                            item.name !== 'Overview') ||
                          (pathName === `${href}` && item.name === 'Overview');

                        return (
                          <Link
                            key={`${href}-${index}-${item.link}`}
                            href={`${href}/${item.link}`}
                            className={`px-4 py-2 text-sm capitalize hover:bg-gray-200 ${isActive && 'bg-[#F9F9FB] text-[#256DDC]'}`}
                          >
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              </div>
            );
          })}
      </div>
    </>
  );
}
