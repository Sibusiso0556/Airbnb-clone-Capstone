import './CityCard.css';

export default function CityCard({ title, distance, image, accent }) {
  return (
    <div className="city-card">
      <img src={image} alt={title} className="city-card__image" />
      <div className="city-card__overlay" style={{ background: accent }}>
        <p className="city-card__title">{title}</p>
        <p className="city-card__distance">{distance}</p>
      </div>
    </div>
  );
}
