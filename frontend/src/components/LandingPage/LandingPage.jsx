import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { spots } from '../../store/session';
import './LandingPage.css';
function LandingPage() {
  const [spotsData, setSpotsData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await spots();
        setSpotsData(data.Spots);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="landing-page-container">
      <div className="spot-tile-list">
        {spotsData && spotsData.map((spot) => (
          <div
            key={spot.id}
            className="spot-tile"
            title={spot.name}
          >
            <Link to={`/spots/${spot.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {spot.previewImage ? (
                  <img className="single-image" src={spot.previewImage} alt="Spot" />
                ) : (
                  <img className="single-image" src={'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'} alt="Spot" />
                )}
              <div className="spot-details-one">
                  <p>{spot.city}, {spot.state}</p>
                  <div className='rating'>
                      <img src={'https://static.vecteezy.com/system/resources/previews/021/508/043/non_2x/black-star-black-shotting-star-transparent-black-bokeh-stars-free-free-png.png'} alt={spot.name} className="star-img" />
                      <p>{spot.avgStarRating ? spot.avgStarRating.toFixed(1) : 'New'}</p>
                  </div>
              </div>
              <div className="spot-details-two">
                  <p>${spot.price} night</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LandingPage;
