import React from 'react';
import NavBar from '../components/NavBar'
import Home from '../components/Home'
import Email from './Email'
import Password from './Password'
import { BrowserRouter, Route } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <div>
        <NavBar />
        <Route exact path='/' component={Home}></ Route>
        <Route exact path='/Email' component={Email}></ Route>
        <Route exact path='/Password' component={Password}></ Route>
      </div>
    </BrowserRouter>
  );
}

export default App;
