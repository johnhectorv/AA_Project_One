import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllSpotsByCurrentUser, deleteSpot } from '../../store/session';

function ManageSpots() {
  const [spotsData, setSpotsData] = useState(null);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllSpotsByCurrentUser();
        setSpotsData(data.Spots);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const handleDeleteSpot = (spotId) => {
    setSelectedSpotId(spotId);
    setShowModal(true);
  };

  const confirmDeleteSpot = async () => {
    try {
      await deleteSpot(selectedSpotId);
      setSpotsData(spotsData.filter(spot => spot.id !== selectedSpotId));
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting spot:', error);
    }
  };

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
                      <img src={'https://static.vecteezy.com/system/resources/previews/021/508/043/non_2x/black-star-black-shotting-star-transparent-black-bokeh-stars-free-free-png.png'} alt={spot.name} className="star-img" />
                      <p>{spot.avgStarRating ? spot.avgStarRating.toFixed(1) : 'New'}</p>
                    </div>
                  </div>
                  <div className="spot-details-two">
                    <p>${spot.price} night</p>
                  </div>
                </Link>
                <div className="spot-buttons">
                  <Link to={`/edit-spot/${spot.id}`}>
                    <button>Update</button>
                  </Link>
                  <button onClick={() => handleDeleteSpot(spot.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p>No spots have been posted yet.</p>
            <Link to="/create-spot">Create a New Spot</Link>
          </div>
        )}
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to remove this spot from the listings?</p>
            <div className="modal-buttons">
              <button className='yes-button' onClick={confirmDeleteSpot}>Yes (Delete Spot)</button>
              <button className='no-button' onClick={() => setShowModal(false)}>No (Keep Spot)</button>
            </div>
          </div>
          <div></div>
        </div>
      )}
    </div>
  );
}

export default ManageSpots;
