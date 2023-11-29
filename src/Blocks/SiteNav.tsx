import { Fragment, ReactNode, useRef, useState ,useEffect,useContext} from 'react';
import { CalendarIcon, ChartPieIcon, DocumentDuplicateIcon, FolderIcon, HomeIcon, UsersIcon } from '@heroicons/react/24/outline';
import { DashLogo } from '@/components/images';
import { useRouter } from 'next/router';
import React from 'react';
import { getFirestore, collection, doc, setDoc, addDoc,getDocs, DocumentData, getDoc, where, query } from 'firebase/firestore'; 
import firebaseApp, { fbDb } from "@/firebase/configs"; 
import { createContext } from 'react';
import { useAuthContext } from '@/components/Authentication/AuthProvider';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


interface Props {
  children: ReactNode;
} 
interface User {
  email: string; 
  firstname: string;
  lastname: string;
}
interface AuthContext {
  currentUser: User | null;
}
export function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(' ');
}
export default function SiteNav({ children }: Props) {
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true); 
  const [fetchedAdmins, setFetchedAdmins] = useState<DocumentData[]>([]);   
  const [adminDetails, setadminDetails] = useState<any | null>(null);  
  // const { currentUser } = useAuthContext(); 
  const [userInitials, setUserInitials] = useState<string>('');  // Add this line to declare userInitials as a state variable

   const { currentUser } = useAuthContext() as AuthContext;
 
  console.log("Current User",currentUser);
  
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const auth = getAuth(firebaseApp);
  
        onAuthStateChanged(auth, (user) => {
          if (user) {
            const email = user.email;
            const adminsCollectionRef = collection(fbDb, 'admins');
            const queryRef = query(adminsCollectionRef, where('email', '==', email));
  
            getDocs(queryRef)
              .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                  querySnapshot.forEach((doc) => {
                    const adminData = doc.data();
                    console.log('Admin Data:', adminData);
                    setadminDetails(adminData);
  
                    // Update user initials based on firstname and lastname
                    const initials =
                      adminData.firstname?.charAt(0).toUpperCase() +
                      adminData.lastname?.charAt(0).toUpperCase();
                      setUserInitials(initials);
                  });
                } else {
                  console.log('Admin document not found');
                }
              })
              .catch((error) => {
                console.error('Error fetching admin:', error);
              });
          } else {
            console.log('User not logged in');
          }
        });
      } catch (error) {
        console.error('Error fetching admin:', error);
      }
    };
  
    fetchAdmin();
  }, [currentUser]);
  

const isSuperAdmin = adminDetails?.superadmin; 
console.log("Admin Details",adminDetails); 


const navigation = [
  { name: 'Dashboard', href: '/Dashboard', icon: HomeIcon, current: true,visible: true },
  { name: 'Administration', href: '/Administration', icon: UsersIcon, current: false,  visible:true},
  { name: 'Vehicles', href: '/Vehicles', icon: FolderIcon, current: false, visible: true },
  { name: 'Trips', href: '/Trips', icon: CalendarIcon, current: false, visible: true },
  { name: 'Report', href: '/Clients', icon: DocumentDuplicateIcon, current: false, visible: true },
];

  const toggleSidebar = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const preventLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <>
        <div className=' flex '>
        <div className="flex flex-row">
          <div
            ref={drawerRef}
            className={`flex flex-col bg-d-blue h-screen overflow-y-auto px-6 lg:w-72 ${isDrawerOpen ? 'lg:w-72 h-screen' : 'hidden'}`}
          >
            <div className="flex h-16 py-3 pb-4 shrink-0 items-center">
              <DashLogo /> 

              {/* Group 1000002034 */}
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                <ul role="list" className="-mx-2 space-y-1">
                   {navigation.map((item) => { 
                    
                            if (item.visible) {
                         return (
                        <a
                       key={item.name}
                      href={item.href}
                      className={classNames(
                     router.pathname === item.href
                         ? 'bg-light-green text-white'
                     : 'text-indigo-200 hover-text-white hover-bg-light-green',
                     'group flex gap-x-3 rounded-md p-2 text-xl leading-6 font-semibold'
                     )}
                       >
                      <item.icon
                     className={classNames(
                    router.pathname === item.href ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                    'h-6 w-6 shrink-0'
                    )}
                     aria-hidden="true"
                      />
                    {item.name}
                     </a>
                     );
                     } else {
                    return null; // Don't render this item
                       }
                       })}
                    </ul>

                </li>
              </ul>
            </nav>
          </div> 
          <div className="bg-[#F34C4C]"></div>
          <div className={`flex flex-row fixed top-0 h-10 bg-[#FFFFFF] flex items-center shadow-inner ${isDrawerOpen ? 'fixed left-72 w-full' : 'w-full'}`}>
          <div className={`ml-4 lg:fixed ${isDrawerOpen ? 'fixed left-72 ml-16' : 'fixed left-7'} cursor-pointer`} onClick={toggleSidebar}>
          <i className="fa fa-bars" aria-hidden="true"></i>
        </div> 
          <div className='mb-6'>
          <img src="Frame 13.png" className="fixed right-14 w-8" alt="" />
          {/* <img src="Ellipse 1.png" className="w-9 fixed right-4 pl-2" alt="" /> */} 
          <div className="fixed right-4 w-8 h-8  text-white bg-[#065AD8] rounded-full flex items-center justify-center">
          {userInitials}
        </div> 
        </div> 
        </div> 
        </div> 
          {/* Main content */}
          <div
            className={`bg-[#FAFAFB] px-4 py-10 ${isDrawerOpen ? 'lg:w-full sm:px-6 lg:px-8' : 'lg:w-full'} transition-all ease-in-out duration-300`}
          >
            {children}
          </div> 
        </div>
    </>
  );
}