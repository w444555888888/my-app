import React from 'react'
import "./app.scss"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { routeConfig } from './routes/routes'
import { ProtectedRoute } from './routes/ProtectedRoute'
import axios from 'axios'

function App() {
  axios.defaults.withCredentials = true
  const { login } = useSelector((state) => state.user)

  return (
    <div className="App">
      <Router>
        <Routes>
          {routeConfig.map(({ path, element: Element, requireAuth }) => (
            <Route
              key={path}
              path={path}
              element={
                requireAuth ? (
                  <ProtectedRoute login={login}>
                    <Element />
                  </ProtectedRoute>
                ) : (
                  <Element />
                )
              }
            />
          ))}
        </Routes>
      </Router>
    </div>
  )
}

export default App