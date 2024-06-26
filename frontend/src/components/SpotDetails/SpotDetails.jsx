import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import './SpotDetails.css';
import { spotDetailsById, reviewBySpotId, deleteReview } from '../../store/session';
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import ReviewFormModal from '../ReviewFormModal/ReviewFormModal';

function SpotDetails() {
  const [spotData, setSpotData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const sessionUser = useSelector(state => state.session.user);
  const { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        const spotDataResponse = await spotDetailsById(id);
        setSpotData(spotDataResponse);

        const reviewsData = await reviewBySpotId(id);
        setReviews(reviewsData.Reviews);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, [id]);

  const handleReserve = () => {
    alert('Feature coming soon');
    console.log(spotData.SpotImages)
  };

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

  const noReview = () => {
    return reviews.some(review => review.User.id === sessionUser.id);
  }

  const reviewButton = () => {
    return (
      <div>
        <button className='post-review-button-list'>
          <OpenModalMenuItem
            itemText="Post Your Review"
            modalComponent={<ReviewFormModal spotId={id} />}
          />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="spot-details">
        {spotData && (
          <div>
            <h2 className="spot-details__name">{spotData.name}</h2>
            <p className="spot-details__location">Location: {spotData.city}, {spotData.state}, {spotData.country}</p>
            <div className="spot-details__image-boxes">
              <div className="spot-details__single-image">
                {spotData.SpotImages.length > 0 ? (
                  <img className="single-image" src={spotData.SpotImages[0].url} alt="Spot" />
                ) : (
                  <img className="single-image" src={'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'} alt="Spot" />
                )}
              </div>
              <div className="spot-details__multiple-images">
                {spotData.SpotImages.length > 1 && (
                  <img className="multi-image" src={spotData.SpotImages[1].url} alt="Spot 1" />
                )}
                {spotData.SpotImages.length > 2 && (
                  <img className="multi-image" src={spotData.SpotImages[2].url} alt="Spot 2" />
                )}
                {spotData.SpotImages.length > 3 && (
                  <img className="multi-image" src={spotData.SpotImages[3].url} alt="Spot 3" />
                )}
                {spotData.SpotImages.length > 4 && (
                  <img className="multi-image" src={spotData.SpotImages[4].url} alt="Spot 4" />
                )}
              </div>
            </div>
            <div className='description-box-container'>
              <div className='description-container'>
                { spotData.Owner !== null ? (
                  <div className='hostedBy'> Hosted by {spotData.Owner.firstName} {spotData.Owner.lastName} </div>
                ) : (
                  <div className='hostedBy'> Hosted by </div>
                )}
                <div className='discription'>{spotData.description}</div>
              </div>
              <div className='box-container'>
                <div className='box'>
                  <div className='top-section'>
                    <div className='left-section'>
                      <div className='price'> ${spotData.price} night </div>
                    </div>
                    <div className='right-section'>
                      <div className='rating-box'>
                        <div className='rating'>
                          <div className='star'>
                            <img src={'https://static.vecteezy.com/system/resources/previews/021/508/043/non_2x/black-star-black-shotting-star-transparent-black-bokeh-stars-free-free-png.png'} className="star-img" alt="Star" />
                          </div>
                          <div className='avg-rating'>{spotData.avgStarRating ? spotData.avgStarRating.toFixed(1) : 'New'}</div>
                        </div>
                        {spotData.numReviews !== 0 && (
                          <>
                            <span className='dot'> · </span>
                            <p>{spotData.numReviews === 1 ? "1 Review" : `${spotData.numReviews} Reviews`}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='bottom-section'>
                    <button className="spot-details__reserve-button" onClick={handleReserve}>Reserve</button>
                  </div>
                </div>
              </div>
            </div>
            <div className='line-container'>
              <div className='line'> </div>
            </div>
            <div>
              { sessionUser !== null ? (
                <div className='logged-in-container'>
                  { sessionUser.id === spotData.ownerId ? (
                    <div className='spot-owner'>
                      { spotData.numReviews !== 0 ? (
                        <div className='has-reviews'>
                          <div className='rating-box-2'>
                            <div className='rating'>
                              <div className='star'>
                                <img src={'https://static.vecteezy.com/system/resources/previews/021/508/043/non_2x/black-star-black-shotting-star-transparent-black-bokeh-stars-free-free-png.png'} className='new-spot-star' alt='New Spot Star' />
                              </div>
                              <div className='avg-rating'>{spotData.avgStarRating ? spotData.avgStarRating.toFixed(1) : 'New'}</div>
                            </div>
                            {spotData.numReviews !== 0 && (
                              <>
                                <span className='dot-2'> · </span>
                                <p>{spotData.numReviews === 1 ? '1 Review' : `${spotData.numReviews} Reviews`}</p>
                              </>
                            )}
                          </div>
                          <div>
                            <ReviewsList reviews={reviews} handleDeleteReview={handleDeleteReview} sessionUser={sessionUser} />
                          </div>
                        </div>
                      ) : (
                        <div className='no-reviews'>
                          <div className='rating'>
                            <div className='star'>
                              <img src={'https://static.vecteezy.com/system/resources/previews/021/508/043/non_2x/black-star-black-shotting-star-transparent-black-bokeh-stars-free-free-png.png'} className='new-spot-star' alt='New Spot Star' />
                            </div>
                            <div className='new'>New</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='not-spot-owner'>
                      { spotData.avgStarRating !== null ? (
                        <div className='has-reviews'>
                          { (!noReview()) ? (
                            <div className='user-not-reviewed'>
                              <div className='rating-box-2'>
                                <div className='rating'>
                                  <div className='star'>
                                    <img src={'https://static.vecteezy.com/system/resources/previews/021/508/043/non_2x/black-star-black-shotting-star-transparent-black-bokeh-stars-free-free-png.png'} className='new-spot-star' alt='New Spot Star' />
                                  </div>
                                  <div className='avg-rating'>{spotData.avgStarRating ? spotData.avgStarRating.toFixed(1) : 'New'}</div>
                                </div>
                                {spotData.numReviews !== 0 && (
                                  <>
                                    <span className='dot-2'> · </span>
                                    <p>{spotData.numReviews === 1 ? '1 Review' : `${spotData.numReviews} Reviews`}</p>
                                  </>
                                )}
                              </div>
                              <div>
                                { reviewButton() }
                              </div>
                              <div>
                                <ReviewsList reviews={reviews} handleDeleteReview={handleDeleteReview} sessionUser={sessionUser} />
                              </div>
                            </div>
                          ) : (
                            <div className='user-reviewed'>
                              <div className='rating-box-2'>
                                <div className='rating'>
                                  <div className='star'>
                                    <img src={'https://static.vecteezy.com/system/resources/previews/021/508/043/non_2x/black-star-black-shotting-star-transparent-black-bokeh-stars-free-free-png.png'} className='new-spot-star' alt='New Spot Star' />
                                  </div>
                                  <div className='avg-rating'>{spotData.avgStarRating ? spotData.avgStarRating.toFixed(1) : 'New'}</div>
                                </div>
                                {spotData.numReviews !== 0 && (
                                  <>
                                    <span className='dot-2'> · </span>
                                    <p>{spotData.numReviews === 1 ? '1 Review' : `${spotData.numReviews} Reviews`}</p>
                                  </>
                                )}
                              </div>
                              <div>
                                <ReviewsList reviews={reviews} handleDeleteReview={handleDeleteReview} sessionUser={sessionUser} />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className='no-reviews'>
                          <div className='rating'>
                            <div className='star'>
                              <img src={'https://static.vecteezy.com/system/resources/previews/021/508/043/non_2x/black-star-black-shotting-star-transparent-black-bokeh-stars-free-free-png.png'} className='new-spot-star' alt='New Spot Star' />
                            </div>
                            <div className='new'>New</div>
                          </div>
                          <div>
                            { reviewButton() }
                          </div>
                          <div>
                            <div className='first-text'> Be the first to post a review </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className='logged-out-container'>
                  { spotData.avgStarRating !== null ? (
                    <div className='has-reviews'>
                      <div className='rating-box-2'>
                        <div className='rating'>
                          <div className='star'>
                            <img src={'https://static.vecteezy.com/system/resources/previews/021/508/043/non_2x/black-star-black-shotting-star-transparent-black-bokeh-stars-free-free-png.png'} className='new-spot-star' alt='New Spot Star' />
                          </div>
                          <div className='avg-rating'>{spotData.avgStarRating ? spotData.avgStarRating.toFixed(1) : 'New'}</div>
                        </div>
                        {spotData.numReviews !== 0 && (
                          <>
                            <span className='dot-2'> · </span>
                            <p>{spotData.numReviews === 1 ? '1 Review' : `${spotData.numReviews} Reviews`}</p>
                          </>
                        )}
                      </div>
                      <div>
                        <ReviewsList reviews={reviews} handleDeleteReview={handleDeleteReview} sessionUser={sessionUser} />
                      </div>
                    </div>
                  ) : (
                    <div className='no-reviews'>
                      <div className='rating'>
                        <div className='star'>
                          <img src={'https://static.vecteezy.com/system/resources/previews/021/508/043/non_2x/black-star-black-shotting-star-transparent-black-bokeh-stars-free-free-png.png'} className='new-spot-star' alt='New Spot Star' />
                        </div>
                        <div className='new'>New</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
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
  );
}

function ReviewsList({ reviews, handleDeleteReview, sessionUser }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
  };

  return (
    <div>
      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review">
            <div className="reviewer">{review.User.firstName}</div>
            <div className="date">{formatDate(review.createdAt)}</div>
            <div className="comment">{review.review}</div>

            { sessionUser !== null && review.userId === sessionUser.id ? (
              <button className='delete-review-button' onClick={() => handleDeleteReview(review.id)}>Delete</button>
            ) : (
              <div></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SpotDetails;
