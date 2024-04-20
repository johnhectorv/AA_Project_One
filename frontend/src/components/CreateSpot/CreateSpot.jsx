import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as spotActions from '../../store/session';
import './CreateSpot.css';

function CreateSpot() {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    country: '',
    address: '',
    city: '',
    state: '',
    description: '',
    name: '',
    price: '',
    previewImageUrl: '',
    images: ['', '', '',''],
    lat: 90,
    lng: 180
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    }

    if (!formData.previewImageUrl.trim()) {
      newErrors.previewImageUrl = 'Preview Image URL is required';
    } else if (!/(?:jpg|jpeg|png)$/i.test(formData.previewImageUrl.trim())) {
      newErrors.previewImageUrl = 'Preview Image URL must end with .jpg, .jpeg, or .png';
    }

    formData.images.forEach((imageUrl, index) => {
      if (imageUrl.trim() && !/(?:\.jpg|\.jpeg|\.png)$/i.test(imageUrl.trim())) {
        newErrors[`imageUrl${index + 1}`] = 'Image URL must end with .jpg, .jpeg, or .png';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const savedFormData = sessionStorage.getItem('formData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }

    const savedErrors = sessionStorage.getItem('errors');
    if (savedErrors) {
      setErrors(JSON.parse(savedErrors));
    }
  }, []);

  useEffect(() => {

    sessionStorage.setItem('formData', JSON.stringify(formData));

    sessionStorage.setItem('errors', JSON.stringify(errors));
  }, [formData, errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("imageUrl")) {

      const index = parseInt(name.replace("imageUrl", ""));
      setFormData((prevFormData) => {
        const updatedImageUrls = [...prevFormData.images];
        updatedImageUrls[index - 1] = value;
        return { ...prevFormData, images: updatedImageUrls };
      });
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value
      }));
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: ''
    }));

    validate();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validate();
    if (isValid) {
      try {
        const response = await dispatch(spotActions.createSpot(formData));
        if (response) {
          console.log("Spot created successfully!");
          console.log(formData);
          const spotId = response.id;
          await dispatch(spotActions.addImageToSpot(spotId, ({ url: formData.previewImageUrl, preview: true })));
          formData.images.map(async (image) => {
            if(image.trim()) {
              return dispatch(spotActions.addImageToSpot(spotId, ({ url: image, preview: false })));
            }
            return null;
          });
          sessionStorage.removeItem('formData');
          sessionStorage.removeItem('errors');
          window.location.href = `/spots/${spotId}`;
        } else {
          console.error("Failed to create spot");
        }
      } catch (error) {
        console.error('Error creating spot:', error);
      }
    }
  };


  return (
    <div className="create-spot-container">
      <h1 className="create-spot-title">Create a New Spot</h1>

      <div className="create-spot-section-wrapper">
        {/* First section */}
        <section className="create-spot-section">
          <h2>Where&apos;s your place located?</h2>
          <p>Guests will only get your exact address once they book a reservation.</p>
          <form onSubmit={handleSubmit}>
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
              <label htmlFor="city" className="input-label">
                City:
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
              {!formData.city.trim() && errors.city && (
                <span className="error-message">{errors.city}</span>
              )}
            </div>

            <div className="input-wrapper">
              <label htmlFor="state" className="input-label">
                State:
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                required
              />
              {!formData.state.trim() && errors.state && (
                <span className="error-message">{errors.state}</span>
              )}
            </div>

            {/* Second section */}
            <div className="create-spot-section-wrapper">
              <section className="create-spot-section">
                <h2>Describe your place to guests</h2>
                <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Please write at least 30 characters" minLength={30} required />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </section>
            </div>

            {/* Third section */}
            <div className="create-spot-section-wrapper">
              <section className="create-spot-section">
                <h2>Create a name for your spot</h2>
                <p>Catch guests&apos; attention with a spot name that highlights what makes your place special.</p>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Name of your spot" required />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </section>
            </div>

            {/* Fourth section */}
            <div className="create-spot-section-wrapper">
              <section className="create-spot-section">
                <h2>Set a base price for your spot</h2>
                <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} placeholder="Price per night (USD)" required />
                {errors.price && (
                  <span className="error-message">{errors.price}</span>
                )}
              </section>
            </div>

            {/* Fifth section */}
            <div className="create-spot-section-wrapper">
              <section className="create-spot-section">
                <h2>Liven up your spot with photos</h2>
                <p>Submit a link to at least one photo to publish your spot.</p>
                <input type="text" id="previewImageUrl" name="previewImageUrl" value={formData.previewImageUrl} onChange={handleChange} placeholder="Preview Image URL" required />
                {errors.previewImageUrl && (
                  <span className="error-message">{errors.previewImageUrl}</span>
                )}
                <input type="text" id="imageUrl1" name="imageUrl1" value={formData.images[0]} onChange={handleChange} placeholder="Image URL" />
                {errors.imageUrl1 && (
                  <span className="error-message">{errors.imageUrl1}</span>
                )}
                <input type="text" id="imageUrl2" name="imageUrl2" value={formData.images[1]} onChange={handleChange} placeholder="Image URL" />
                {errors.imageUrl2 && (
                  <span className="error-message">{errors.imageUrl2}</span>
                )}
                <input type="text" id="imageUrl3" name="imageUrl3" value={formData.images[2]} onChange={handleChange} placeholder="Image URL" />
                {errors.imageUrl3 && (
                  <span className="error-message">{errors.imageUrl3}</span>
                )}
                <input type="text" id="imageUrl4" name="imageUrl4" value={formData.images[3]} onChange={handleChange} placeholder="Image URL" />
                {errors.imageUrl4 && (
                  <span className="error-message">{errors.imageUrl4}</span>
                )}
              </section>
            </div>
            <button type="submit" className="create-spot-submit-btn" onClick={handleSubmit}>Create Spot</button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default CreateSpot;
