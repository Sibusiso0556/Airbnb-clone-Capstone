import api from './api';

export async function getWishlist() {
  const { data } = await api.get('/wishlist');
  return data;
}

export async function saveListing(listingId) {
  const { data } = await api.post(`/wishlist/${listingId}`);
  return data;
}

export async function unsaveListing(listingId) {
  const { data } = await api.delete(`/wishlist/${listingId}`);
  return data;
}
