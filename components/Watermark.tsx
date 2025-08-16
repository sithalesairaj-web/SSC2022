
import React from 'react';
import { APP_WATERMARK } from '../constants';

const Watermark: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white text-xs text-center p-1 z-50">
      {APP_WATERMARK}
    </div>
  );
};

export default Watermark;
