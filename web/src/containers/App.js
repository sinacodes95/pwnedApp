import React from 'react';
import NavBar from '../components/NavBar'
import Home from '../components/Home'
import Email from './Email'
import Password from './Password'
import Login from './Login'
import { BrowserRouter, Route } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <div>
        <NavBar />
        <Route exact path='/pwnedApp' component={Home}></ Route>
        <Route exact path='/Email' component={Email}></ Route>
        <Route exact path='/Password' component={Password}></ Route>
        <Route exact path='/Login' component={Login}></ Route>
      </div>
    </BrowserRouter>
  );
}

export default App;
