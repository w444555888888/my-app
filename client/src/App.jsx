import React, { useEffect } from 'react';
import axios from 'axios'
import Div100vh from 'react-div-100vh';
import "./app.scss"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { routeConfig } from './routes/routes'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { logIn, logOut } from './redux/userStore';
import { request } from '../src/utils/apiService';

function App() {
  axios.defaults.withCredentials = true
  const dispatch = useDispatch();
  const { login } = useSelector((state) => state.user)

    useEffect(() => {
    const verifyLogin = async () => {
      const result = await request('GET', '/auth/me');
      if (result.success && result.data) {
        dispatch(logIn());
      } else {
        dispatch(logOut());
      }
    };
    verifyLogin();
  }, [dispatch]);

  return (
    <Div100vh className="App">
      <Router>
        <Routes>
          {routeConfig.map(({ path, element: Element, requireAuth }) => (
            <Route
              key={path}
              path={path}
              element={
                requireAuth ?
                  (<ProtectedRoute login={login} element={<Element />} />)
                  :
                  (<Element />)
              }
            />
          ))}
        </Routes>
      </Router>
    </Div100vh>
  )
}

export default App