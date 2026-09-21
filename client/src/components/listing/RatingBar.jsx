import './RatingBar.css';

export default function RatingBar({ label, score, max = 5 }) {
  const pct = (score / max) * 100;
  return (
    <div className="rating-bar">
      <span className="rating-bar__label">{label}</span>
      <div className="rating-bar__track">
        <div className="rating-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="rating-bar__score">{score.toFixed(1)}</span>
    </div>
  );
}
