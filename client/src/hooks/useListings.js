import { useEffect, useState, useCallback } from 'react';
import * as listingService from '../services/listingService';

export function useListings(params = {}) {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { results, pagination: meta } = await listingService.getListings(JSON.parse(paramsKey));
      setListings(results);
      setPagination(meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load listings.');
    } finally {
      setLoading(false);
    }
    
  }, [paramsKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { listings, pagination, loading, error, refetch };
}
