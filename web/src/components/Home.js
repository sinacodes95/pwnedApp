import React from 'react';
import { NavLink } from 'react-router-dom';

const Home = () => {
  return (
    <div className='container center-align'>
      <div className="row">
        <div className="col s6 l6">
          <div className="card">
            <span className="card-title">Email</span>
            <div className="card-content">
              <p>Click below to check if you have an account that has been compromised in a data breach at any point. We will show you what we find.</p>
            </div>
            <div className="card-action">
              <NavLink to="/pwnedApp/Email">click Here</NavLink>
            </div>
          </div>
        </div>

        <div className="col s6 m6">
          <div className="card">
            <span className="card-title">Password</span>
            <div className="card-content">
              <p>Pwned Passwords are 551,509,767 real world passwords previously exposed in data breaches. Click below to see if your Password was one of them.</p>
            </div>
            <div className="card-action">
              <NavLink to="/pwnedApp/Password">click here</NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;