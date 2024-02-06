import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem'; 
import { AuthProvider, useAuthContext } from "@/components/Authentication/AuthProvider";
import {ArrowDownTrayIcon, ChevronDownIcon, InboxArrowDownIcon, PlusIcon} from "@heroicons/react/24/solid";
import { DocumentData, getFirestore, query, collection, where, onSnapshot } from '@firebase/firestore';


export default function PositionedMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [fetchedTrips, setfetchedTrips]=React.useState<DocumentData[]>([]);  

  const open = Boolean(anchorEl); 
  const {organisationId}= useAuthContext() 
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  }; 
  React.useEffect(() => { 
      const fetchedTrips = async () => { 
        const db = getFirestore();

       try {
       if (organisationId) {
      const q = query(collection(db, 'trips'), where('organisationId', '==', organisationId));

     const unsubscribe = onSnapshot(q, (querySnapshot) => {
     const tripsData = querySnapshot.docs.map((doc) => ({
     id: doc.id,
     ...doc.data(),
     }));
    setfetchedTrips(tripsData);
     });

     return () => unsubscribe(); 

     } else {
       console.error('Organisation ID is not available.');
     }  
   } catch (error) {
     console.error('Error fetching Trips:', error);
   }
 };


    fetchedTrips();
    
}, [organisationId]); 

  return (
    <div>
      <Button
        id="demo-positioned-button"
        aria-controls={open ? 'demo-positioned-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        All 
        <ChevronDownIcon className='ml-2 h-4 w-4'/>

      </Button>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleClose}>This Week</MenuItem>
        <MenuItem onClick={handleClose}>This Month</MenuItem>
        <MenuItem onClick={handleClose}>This Year</MenuItem>
      </Menu>
    </div>
  );
}