import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as wishlistService from '../services/wishlistService';
import { WishlistContext } from './wishlist-context';

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [savedIds, setSavedIds] = useState(() => new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      setSavedIds((current) => (current.size === 0 ? current : new Set()));
      return;
    }
    wishlistService
      .getWishlist()
      .then((listings) => setSavedIds(new Set(listings.map((l) => l._id))))
      .catch(() => {
       
      });
  }, [isAuthenticated]);

  const toggleSave = useCallback(
    async (listingId) => {
      if (!isAuthenticated) return false;
      const wasSaved = savedIds.has(listingId);

      setSavedIds((current) => {
        const next = new Set(current);
        if (wasSaved) next.delete(listingId);
        else next.add(listingId);
        return next;
      });

      try {
        if (wasSaved) await wishlistService.unsaveListing(listingId);
        else await wishlistService.saveListing(listingId);
        return true;
      } catch {
        setSavedIds((current) => {
          const next = new Set(current);
          if (wasSaved) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
        return false;
      }
    },
    [isAuthenticated, savedIds]
  );

  const value = useMemo(
    () => ({
      savedIds,
      isSaved: (id) => savedIds.has(id),
      toggleSave,
    }),
    [savedIds, toggleSave]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
