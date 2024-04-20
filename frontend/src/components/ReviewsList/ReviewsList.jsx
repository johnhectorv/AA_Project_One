import { useState, useEffect } from 'react';
import { reviewBySpotId } from '../../store/session';
import { useParams } from 'react-router-dom';
import './ReviewsList.css';

function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await reviewBySpotId(id);
        const sortedReviews = data.Reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReviews(sortedReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    }

    fetchReviews();
  }, [id]);

  return (
    <div>
      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review">
            <div className="reviewer">{review.User.firstName}</div>
            <div className="date">{formatDate(review.createdAt)}</div>
            <div className="comment">{review.review}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
}

export default ReviewsList;
