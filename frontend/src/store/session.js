
import { csrfFetch } from './csrf';

const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";

const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user
  };
};

const removeUser = () => {
  return {
    type: REMOVE_USER
  };
};

export const login = (user) => async (dispatch) => {
  const { credential, password } = user;
  const response = await csrfFetch("/api/session", {
    method: "POST",
    body: JSON.stringify({
      credential,
      password
    })
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
};

export const signup = (user) => async (dispatch) => {
  const { username, firstName, lastName, email, password } = user;
  const response = await csrfFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({
      username,
      firstName,
      lastName,
      email,
      password
    })
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

export const restoreUser = () => async (dispatch) => {
  const response = await csrfFetch("/api/session");
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

export const logout = () => async (dispatch) => {
    const response = await csrfFetch('/api/session', {
      method: 'DELETE'
    });
    dispatch(removeUser());
    return response;
  };

  export const spots = async () => {
    try {
      const response = await csrfFetch('/api/spots', {
        method: 'GET'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching spots:', error);
      throw error;
    }
  }

  export const currentUser = async () => {
    try {
      const response = await csrfFetch('/api/session', {
        method: 'GET'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching spots:', error);
      throw error;
    }
  }

  export const spotDetailsById = async (spotId) => {
    try {
      if (isNaN(parseInt(spotId))) {
        throw new Error('Invalid spot ID. Must be an integer.');
      }

      const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'GET'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching spot details:', error);
      throw error;
    }
  }

  export const reviewBySpotId = async (spotId) => {
    try {
      const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
        method: 'GET'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }



  export const createSpot = (spotData) => async (dispatch) => {
    try {
      const response = await csrfFetch("/api/spots", {
        method: "POST",
        body: JSON.stringify(spotData)
      });

      if (!response.ok) {
        throw new Error('Failed to create spot');
      }

      const data = await response.json();
      dispatch(setUser(data.user));
      return data;
    } catch (error) {
      console.error('Error creating spot:', error);
      throw error;
    }
  };

  export const addImageToSpot = (spotId, imageData) => async () => {
    try {
      const response = await csrfFetch(`/api/spots/${spotId}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(imageData)
      });

      if (!response.ok) {
        throw new Error('Failed to add image to spot');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding image to spot:', error);
      throw error;
    }
  };

  export const addReviewToSpot = (spotId, reviewData) => async () => {
    try {
      const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          const validationErrors = errorData.errors;
          throw new Error(`Validation Error: ${JSON.stringify(validationErrors)}`);
        } else if (response.status === 404) {
          throw new Error('Spot not found');
        } else if (response.status === 500) {
          throw new Error('User already has a review for this spot');
        } else {
          throw new Error('Failed to add review to spot');
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding review to spot:', error);
      throw error;
    }
  };

  export const deleteReview = (reviewId) => async () => {
    try {
      const response = await csrfFetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Review couldn\'t be found');
        } else {
          throw new Error('Failed to delete review');
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  };

  export const getAllSpotsByCurrentUser = async () => {
    try {
      const response = await csrfFetch('/api/spots/current', {
        method: 'GET'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching spots:', error);
      throw error;
    }
  }

  export const deleteSpot = (spotId) => async () => {
    try {
      const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Spot couldn\'t be found');
        } else {
          throw new Error('Failed to delete spot');
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting spot:', error);
      throw error;
    }
  };



export default sessionReducer;
