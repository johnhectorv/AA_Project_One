import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';
import * as sessionActions from './store/session';
import LandingPage from './components/LandingPage';
import SpotDetails from './components/SpotDetails';
import CreateSpot from './components/CreateSpot';
import ReviewsList from './components/ReviewsList';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/spots/:id',
        element: <SpotDetails/>
      },
      {
        path: '/create-spot',
        element: <CreateSpot />
      },
      {
        path: '/reviews/:id',
        element: <ReviewsList />
      },
      {
        path: '/test',
        element: <div>hTEST!!</div>
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
