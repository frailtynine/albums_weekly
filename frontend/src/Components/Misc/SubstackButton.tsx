import React from 'react';
import { Button } from '@mui/material';

interface OpenSubstackProps {
  type: 'posts' | 'podcasts';
  dataToCopy: string;
  openSubstack?: boolean;
}




const SubstackButton: React.FC<OpenSubstackProps> = ({ type, dataToCopy, openSubstack = true }) => {
  const url = `https://albumsweekly.substack.com/publish/post?type=${
    type === 'posts' ? 'newsletter' : 'podcast'
  }`
  const handleClick = async () => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([dataToCopy], { type: 'text/html' }),
          'text/plain': new Blob([dataToCopy], { type: 'text/plain' }),
        }),
      ]);
    } catch (err) {
      console.error('Failed to copy data to clipboard', err);
    }
    if (openSubstack) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Button onClick={handleClick} style={{ width: '100px', fontWeight: '500' }}>
      {openSubstack ? 'Create' : 'Copy'}
    </Button>
  );
};

export default SubstackButton;