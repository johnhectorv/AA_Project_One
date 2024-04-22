import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { spotDetailsById, reviewBySpotId } from '../../store/session';
import { useParams } from 'react-router-dom';
import './SpotDetails.css';
import ReviewsList from '../ReviewsList';
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import ReviewFormModal from '../ReviewFormModal/ReviewFormModal';


function SpotDetails() {
  const [spotData, setSpotData] = useState(null);
  const [reviews, setReviews] = useState([]);
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
    console.log(spotData.avgStarRating)
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
              <img className="single-image" src={'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'} alt="Spot" />
            </div>
            <div className="spot-details__multiple-images">
              {spotData.SpotImages.slice(1).map((image, index) => (
              image.url && <img key={index} className="multi-image" src={image.url} alt={`Spot ${index}`} />
              ))}
            </div>
          </div>
          <div className='description-box-container'>
            <div className='description-container'>
              <div className='hostedBy'> Hosted by {spotData.Owner.firstName} {spotData.Owner.lastName} </div>
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
                          <img src='../../../img/star.png' className="star-img" alt="Star" />
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
                                logged-owner-reviews CHECKED
                                <div className='rating-box-2'>
                                    <div className='rating'>
                                        <div className='star'>
                                            <img src='../../../img/star.png' className='new-spot-star' alt='New Spot Star' />
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
                                  <ReviewsList/>
                                </div>
                            </div>
                        ) : (
                            <div className='no-reviews'>
                                logged-owner-!reviews CHECKED
                                <div className='rating'>
                                    <div className='star'>
                                        <img src='../../../img/star.png' className='new-spot-star' alt='New Spot Star' />
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
                                        logged-!owner-reviews-!reviewed
                                        <div className='rating-box-2'>
                                            <div className='rating'>
                                                <div className='star'>
                                                    <img src='../../../img/star.png' className='new-spot-star' alt='New Spot Star' />
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
                                          <ReviewsList/>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='user-reviewed'>
                                        logged-!owner-reviews-reviewed CHECKED
                                        <div className='rating-box-2'>
                                            <div className='rating'>
                                                 <div className='star'>
                                                    <img src='../../../img/star.png' className='new-spot-star' alt='New Spot Star' />
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
                                          <ReviewsList/>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className='no-reviews'>
                                logged-!user-!reviews CHECKED
                                <div className='rating'>
                                    <div className='star'>
                                        <img src='../../../img/star.png' className='new-spot-star' alt='New Spot Star' />
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
                        !logged-reviews CHECKED
                        <div className='rating-box-2'>
                            <div className='rating'>
                                <div className='star'>
                                     <img src='../../../img/star.png' className='new-spot-star' alt='New Spot Star' />
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
                          <ReviewsList/>
                        </div>
                    </div>
                ) : (
                    <div className='no-reviews'>
                        !logged-!reviews CHECKED
                        <div className='rating'>
                            <div className='star'>
                                <img src='../../../img/star.png' className='new-spot-star' alt='New Spot Star' />
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
  </div>
);
}

export default SpotDetails;
