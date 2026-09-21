import api from './api';

export async function getListings(params = {}) {
  const { data } = await api.get('/listings', { params });
  return data; // { results, pagination }
}

export async function getListingById(id) {
  const { data } = await api.get(`/listings/${id}`);
  return data;
}

export async function getMyListings() {
  const { data } = await api.get('/listings/host/mine');
  return data;
}

export async function createListing(payload) {
  const { data } = await api.post('/listings', payload);
  return data;
}

export async function updateListing(id, payload) {
  const { data } = await api.put(`/listings/${id}`, payload);
  return data;
}

export async function deleteListing(id) {
  const { data } = await api.delete(`/listings/${id}`);
  return data;
}
