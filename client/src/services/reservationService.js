import api from './api';

export async function createReservation(payload) {
  const { data } = await api.post('/reservations', payload);
  return data;
}

export async function getMyReservations() {
  const { data } = await api.get('/reservations/mine');
  return data;
}

export async function getHostReservations() {
  const { data } = await api.get('/reservations/host');
  return data;
}

export async function cancelReservation(id) {
  const { data } = await api.delete(`/reservations/${id}`);
  return data;
}
