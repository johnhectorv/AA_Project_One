import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { editSpot } from '../../store/session';
import { spotDetailsById } from '../../store/session';
import { useParams } from 'react-router-dom';
import './EditSpot.css';


function EditSpot() {
  const dispatch = useDispatch();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    lat: '',
    lng: '',
    name: '',
    description: '',
    price: '',

  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchSpotDetails = async () => {
      try {
        const spotDetails = await spotDetailsById(id);
        setFormData({
          country: spotDetails.country,
          address: spotDetails.address,
          city: spotDetails.city,
          state: spotDetails.state,
          description: spotDetails.description,
          name: spotDetails.name,
          price: spotDetails.price,
          lat: 80,
          lng: 80,
        });
      } catch (error) {
        console.error('Error fetching spot details:', error);
      }
    };

    fetchSpotDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Street Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (formData.description.trim().length < 30) {
      newErrors.description = 'Description must be at least 30 characters long';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validate();
    if (isValid) {
      try {
        const response = await dispatch(editSpot(id, formData));
        if (response) {
          console.log("Spot updated successfully!");
          sessionStorage.removeItem('formData');
          sessionStorage.removeItem('errors');
          window.location.href = `/spots/${id}`;
        } else {
          console.error("Failed to update spot");
        }
      } catch (error) {
        console.error('Error updating spot:', error);
      }
    }
  };

  return (
    <div className="update-spot-container">
      <h1 className="update-spot-title">Update your Spot</h1>

      <div className="update-spot-section-wrapper">
        {/* Location Section */}
        <div className="location-section">
          <h2>Where`&apos;`s your place located?</h2>
          <p>Guests will only get your exact address once they book a reservation.</p>
          <form onSubmit={handleSubmit} className='form'>
            {/* Country input */}
            <div className="input-wrapper">
              <label htmlFor="country" className="input-label">
                Country:
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                required
              />
              {!formData.country.trim() && errors.country && (
                <span className="error-message">{errors.country}</span>
              )}
            </div>

            {/* Address input */}
            <div className="input-wrapper">
              <label htmlFor="address" className="input-label">
                Street Address:
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street Address"
                required
              />
              {!formData.address.trim() && errors.address && (
                <span className="error-message">{errors.address}</span>
              )}
            </div>

            <div className="input-wrapper">
                <div className='city-state-container'>
  <label htmlFor="city" className="input-label-city">
    City:
  </label>
  <div className="label-space"></div> {/* New div for spacing */}
  <label htmlFor="state" className="input-label-state">
    State:
  </label>
  </div>
  <div className="city-state-wrapper">
    <div className='city'>
    <input
      type="text"
      id="city"
      name="city"
      value={formData.city}
      onChange={handleChange}
      placeholder="City"
      required
    />
    </div>
    {!formData.city.trim() && errors.city && (
      <span className="error-message">{errors.city}</span>
    )}
    <span className="comma">,</span>
    <div className='state'>
    <input
      type="text"
      id="state"
      name="state"
      value={formData.state}
      onChange={handleChange}
      placeholder="State"
      required
    />
    </div>
    {!formData.state.trim() && errors.state && (
      <span className="error-message">{errors.state}</span>
    )}
  </div>
</div>

            {/* Description Section */}
            <div className="input-wrapper">
              <h2>Describe your place to guests</h2>
              <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                minLength={30}
                required
              />
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>

            {/* Name Section */}
            <div className="input-wrapper">
              <h2>Create a title for your spot</h2>
              <p>Catch guests`&apos;` attention with a spot title that highlights what makes your place special.</p>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name of your spot"
                required
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            {/* Price Section */}
            <div className="input-wrapper">
              <h2>Set a base price for your spot</h2>
              <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Price"
                required
              />
              {!formData.price && errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className='button-container'>
            <button type="submit" className="update-spot-submit-btn">Update Spot</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );






}

export default EditSpot;
