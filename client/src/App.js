import React from 'react'

import { BrowserRouter } from 'react-router-dom';
import { UseRoutes } from './routes';

import './App.scss';
import { useAuth } from './hooks/auth.hook';
import { AuthContext } from './context/AuthContext';
import { useConstructor } from './hooks/constructor.hook';

function App() {
  const auth = useAuth()
  useConstructor(() => { auth.load() })
  const isLogined = !!auth.token

  return (
    <AuthContext.Provider value={{
      ...auth, isLogined
    }}>
      <BrowserRouter forceRefresh={false}>
        <UseRoutes isAuth={isLogined} />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
