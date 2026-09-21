import { useState } from 'react';
import './ReviewComment.css';

export default function ReviewComment({ review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.comment.length > 160;
  const text = expanded || !isLong ? review.comment : `${review.comment.slice(0, 160)}...`;

  return (
    <div className="review-comment">
      <div className="review-comment__header">
        <img src={review.avatar} alt={review.name} className="review-comment__avatar" />
        <div>
          <p className="review-comment__name">{review.name}</p>
          <p className="review-comment__date">{review.date}</p>
        </div>
      </div>
      <p className="review-comment__text">{text}</p>
      {isLong && (
        <button className="review-comment__more" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Show less' : 'Show more'} <span aria-hidden="true">›</span>
        </button>
      )}
    </div>
  );
}
