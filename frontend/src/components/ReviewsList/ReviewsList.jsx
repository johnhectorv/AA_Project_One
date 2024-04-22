import { useState, useEffect } from 'react';
import { reviewBySpotId, deleteReview } from '../../store/session';
import { useParams } from 'react-router-dom';
import './ReviewsList.css';
import { useSelector } from 'react-redux';

function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const { id } = useParams();
  const sessionUser = useSelector(state => state.session.user);
  const [showModal, setShowModal] = useState(false);

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

  const handleDeleteReview = (reviewId) => {
    setSelectedReviewId(reviewId);
    setShowModal(true);
  };

  const confirmDeleteReview = async () => {
    try {
      await deleteReview(selectedReviewId)();
      setReviews(reviews.filter(review => review.id !== selectedReviewId));
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  return (
    <div>
      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review">
            <div className="reviewer">{review.User.firstName}</div>
            <div className="date">{formatDate(review.createdAt)}</div>
            <div className="comment">{review.review}</div>

            { review.userId === sessionUser.id ? (
              <button className='delete-review-button' onClick={() => handleDeleteReview(review.id)}>Delete</button>
            ) : (
              <div></div>
            )}
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this review?</p>
            <div className="modal-buttons">
              <button className='yes-button' onClick={confirmDeleteReview}>Yes (Delete Review)</button>
              <button className='no-button' onClick={() => setShowModal(false)}>No (Keep Review)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
}

export default ReviewsList;
