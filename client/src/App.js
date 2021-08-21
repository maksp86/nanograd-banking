import React from 'react'

import { BrowserRouter } from 'react-router-dom';
import { useRoutes } from './routes';

import './App.scss';
import { useAuth } from './hooks/auth.hook';
import { AuthContext } from './context/AuthContext';

function App() {
  const { token, userid, login, logout } = useAuth()

  const isLogined = !!token
  const routes = useRoutes(isLogined)

  return (
    <AuthContext.Provider value={{
      token, userid, login, logout, isLogined
    }}>
      <BrowserRouter>
        {routes}
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
