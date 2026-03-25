/**
 * Application router — defines all top-level routes using React Router v7.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'

/**
 * AppRouter wraps the application in a BrowserRouter and declares routes.
 */
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main search page */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
