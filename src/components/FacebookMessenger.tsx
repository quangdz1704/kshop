'use client';

import { useEffect } from 'react';

export function FacebookMessenger() {
  useEffect(() => {
    const fbPageId = process.env.NEXT_PUBLIC_FB_PAGE_ID;
    
    if (!fbPageId) {
      console.warn('Facebook Page ID chưa được cấu hình');
      return;
    }

    window.fbAsyncInit = function() {
      window.FB?.init({
        xfbml: true,
        version: 'v18.0'
      });
    };

    (function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = 'https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js';
      fjs.parentNode?.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }, []);

  const fbPageId = process.env.NEXT_PUBLIC_FB_PAGE_ID;
  
  if (!fbPageId) {
    return null;
  }

  const chatProps = {
    className: 'fb-customerchat',
    attribution: 'setup_tool',
    page_id: fbPageId,
    theme_color: '#0084ff',
    logged_in_greeting: 'Xin chào! Chúng tôi có thể giúp gì cho bạn?',
    logged_out_greeting: 'Xin chào! Chúng tôi có thể giúp gì cho bạn?',
  } as React.HTMLAttributes<HTMLDivElement>;

  return (
    <>
      <div id="fb-root" />
      <div {...chatProps} />
    </>
  );
}

declare global {
  interface Window {
    FB?: {
      init: (config: { xfbml?: boolean; version?: string }) => void;
    };
    fbAsyncInit?: () => void;
  }
}
