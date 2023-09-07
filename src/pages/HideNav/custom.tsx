import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import DocumentDuplicateIcon from '@mui/icons-material/ContentCopy';
import FolderIcon from '@mui/icons-material/Folder';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

const CustomIcon = ({ icon }:any) => {
  switch (icon) {
    case 'HomeIcon':
      return <HomeIcon />;
    // case 'UsersIcon':
    //   return <UsersIcon />;
    case 'CalendarIcon':
      return <CalendarIcon />;
    case 'DocumentDuplicateIcon':
      return <DocumentDuplicateIcon />;
    case 'FolderIcon':
      return <FolderIcon />;
    case 'InboxIcon':
      return <InboxIcon />;
    case 'MailIcon':
      return <MailIcon />;
    // case 'Bars3Icon':
    //   return <Bars3Icon />;
    default:
      return null;
  }
};

export default CustomIcon;
