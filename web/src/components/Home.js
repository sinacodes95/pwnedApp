import React from 'react';

const Home = () => {
  return (
    <div className='container center-align'>
    <div class="row">
    <div class="col s6 l6">
      <div class="card">
        <div class="card-image">
          <img src="emailStockPhoto.jpg"></img>
          <span class="card-title">Email</span>
        </div>
        <div class="card-content">
          <p>Click below to check if you have an account that has been compromised in a data breach at any point. We will show you what we find.</p>
        </div>
        <div class="card-action">
          <a href="/Email">click Here</a>
        </div>
      </div>
    </div>

    <div class="col s6 m6">
      <div class="card">
        <div class="card-image">
          <img src="passwordStockPhoto.jpg"></img>
          <span class="card-title">Password</span>
        </div>
        <div class="card-content">
          <p>Pwned Passwords are 551,509,767 real world passwords previously exposed in data breaches. Click below to see if your Password was one of them.</p>
        </div>
        <div class="card-action">
          <a href="/Password">click here</a>
        </div>
      </div>
    </div>
  </div>
  </div>
  );
}

export default Home;