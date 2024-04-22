import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllSpotsByCurrentUser } from '../../store/session';

function ManageSpots() {
  const [spotsData, setSpotsData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllSpotsByCurrentUser();
        console.log(data.Spots)
        setSpotsData(data.Spots);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="landing-page-container">
      <div>Manage Spots</div>
        <div>
            {spotsData && spotsData.length > 0 ? (
                <div className="spot-tile-list">
                    {spotsData.map((spot) => (
                        <div key={spot.id} className="spot-tile" title={spot.name}>
                            <Link to={`/spots/${spot.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {spot.previewImage ? (
                                    <img src={spot.previewImage} alt={spot.name} className="spot-thumbnail" />
                                ) : (
                                    <img src={`https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg`} alt={spot.name} className="spot-thumbnail" />
                                )}
                                <div className="spot-details-one">
                                    <p>{spot.city}, {spot.state}</p>
                                    <div className='rating'>
                                        <img src='../../../img/star.png' alt={spot.name} className="star-img" />
                                         <p>{spot.avgStarRating ? spot.avgStarRating.toFixed(1) : 'New'}</p>
                                     </div>
                                </div>
                                <div className="spot-details-two">
                                    <p>${spot.price} night</p>
                                </div>
                            </Link>
                            <div className="spot-buttons">
                                <button onClick={() => handleUpdate(spot.id)}>Update</button>
                                <button onClick={() => handleDelete(spot.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
                    ) : (
                <div>
                    <p>No spots have been posted yet.</p>
                    <Link to="/new-spot">Create a New Spot</Link>
                </div>
            )}
        </div>
    </div>
  );

  // Define functions to handle update and delete actions
  const handleUpdate = (spotId) => {
    // Implement update logic
    console.log('Update spot with ID:', spotId);
  };

  const handleDelete = (spotId) => {
    // Implement delete logic
    console.log('Delete spot with ID:', spotId);
  };
}

export default ManageSpots;
