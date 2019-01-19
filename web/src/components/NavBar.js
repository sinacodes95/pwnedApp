import React from 'react';
import {NavLink} from 'react-router-dom'

const NavBar = () => {
  return (
    <nav className='nav-wrapper'>
      <div className='container'>
      <a className='brand-logo left'>';-- Have i Been Pwned?</a>
      <ul className='right'>
        <li><NavLink to='/'>Home</NavLink></li>
        <li><NavLink to='/Email'>Email</NavLink></li>
        <li><NavLink to='/Password'>Password</NavLink></li>
        <li><NavLink to='/Login'>Login</NavLink></li>
      </ul>
      </div>
    </nav>
  );
};

export default NavBar;