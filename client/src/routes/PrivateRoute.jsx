import React from 'react'
import { Navigate } from 'react-router-dom'
import { ROUTES } from './routes'

export const PrivateRoute = ({ children, login }) => {
  return login ? children : <Navigate to={ROUTES.LOGIN} replace />
}