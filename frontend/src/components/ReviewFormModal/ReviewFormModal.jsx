import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { addReviewToSpot } from '../../store/session';
import { FaStar } from 'react-icons/fa';
import './ReviewForm.css';

function ReviewFormModal({ spotId }) {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const [comment, setComment] = useState('');
  const [starRating, setStarRating] = useState(0);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const isButtonDisabled = comment.length < 10 || starRating === 0;

  const handleStarChange = (rating) => {
    setStarRating(rating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reviewData = { review: comment, stars: starRating };
      await dispatch(addReviewToSpot(spotId, reviewData));
      setComment('');
      setStarRating(0);
      setErrors({});
      setServerError(null);
      closeModal();
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('Failed to add review to spot');
      }
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>How was your stay?</h2>
          {serverError && <p className="error-message">{serverError}</p>}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <textarea
            className='text-area'
              placeholder="Leave your review here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={rating}>
                  <input
                    type="radio"
                    name="star"
                    value={rating}
                    checked={starRating === rating}
                    onChange={() => handleStarChange(rating)}
                    style={{ display: 'none' }}
                  />
                  <FaStar
                    className="star"
                    color={rating <= starRating ? '#ffc107' : '#e4e5e9'}
                    size={30}
                  />
                </label>
              ))}
              <label>Stars</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" disabled={isButtonDisabled}>Submit Your Review</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewFormModal;
