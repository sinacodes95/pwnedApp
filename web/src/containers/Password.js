import React, { Component } from 'react';

class Password extends Component {
  constructor() {
    super()
    this.state = {

    }
  }
  render() {
    return (
      <div className='container'>
        <div class="row">
          <div class="col s12 m6">
            <div class="card blue-grey darken-1">
              <div class="card-content white-text">
                <span class="card-title">Password</span>
                <p>Enter your password below to check if it was compromised in a data breach.</p>
                <br></br>
                <br></br>
                <div class="row">
                  <form class="col s12">
                    <div class="row">
                      <div class="input-field col s11 m11">
                        <i class="material-icons prefix">confirmation_number</i>
                        <input id="password" type="password" class="validate"></input>
                        <label for="password">Enter password</label>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div class="card-action">
                <a href="#">search</a>
              </div>
            </div>
          </div>
        </div>



      </div>
    );
  }
}

export default Password;