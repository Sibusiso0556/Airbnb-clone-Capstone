import { formatDateDMY } from '../../utils/format';
import './ReservationsTable.css';

export default function ReservationsTable({ reservations, bookedByLabel, onDelete, deletingId }) {
  return (
    <table className="reservations-table">
      <thead>
        <tr>
          <th>Booked by</th>
          <th>Property name</th>
          <th>Check-in Date</th>
          <th>Check-out Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {reservations.map((res) => (
          <tr key={res._id}>
            <td>{bookedByLabel(res)}</td>
            <td>{res.listing?.city}</td>
            <td>{formatDateDMY(res.checkIn)}</td>
            <td>{formatDateDMY(res.checkOut)}</td>
            <td>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(res._id)}
                disabled={deletingId === res._id}
              >
                {deletingId === res._id ? 'Deleting…' : 'Delete'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
