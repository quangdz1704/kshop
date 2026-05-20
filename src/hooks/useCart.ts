'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useCart() {
  const { data: session } = useSession();
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/cart/count')
        .then((res) => res.json())
        .then((data) => setItemCount(data.count || 0))
        .catch(() => setItemCount(0));
    } else {
      setItemCount(0);
    }
  }, [session]);

  return { itemCount };
}

