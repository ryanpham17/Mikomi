import { createBrowserRouter, Router, RouterProvider } from 'react-router-dom';
import Home from '../components/Home';
import Cards from '../components/Cards';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div><Home /></div>
  },
  {
    path: '/search',
    element: <div><Cards /></div>
  }
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App