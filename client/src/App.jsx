import React from 'react'
import "./app.scss"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { routeConfig } from './routes/routes'
import { PrivateRoute } from './routes/PrivateRoute'
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
                  <PrivateRoute login={login}>
                    <Element />
                  </PrivateRoute>
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