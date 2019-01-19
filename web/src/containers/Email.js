import React, { Component } from 'react';
import './Email.css'

class Email extends Component {
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
            <div class="card light-blue darken-3">
              <div class="card-content white-text">
                <span class="card-title">Email</span>
                <p>Enter your email address below to check if it was compromised in a data breach.</p>
                <p>You may also enter a list of comma separated emails to check multiple accounts.</p>
                <br></br>
                <br></br>
                <div class="row">
                  <form class="col s12">
                    <div class="row">
                      <div class="input-field col s11 m11">
                        <i class="material-icons prefix">mail</i>
                        <textarea id="icon_prefix2" class="materialize-textarea"></textarea>
                        <label for="icon_prefix2">Enter email</label>
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

export default Email;