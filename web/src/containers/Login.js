import React, { Component } from 'react'

class Login extends Component {
  constructor() {
    super();
    this.state = {
      loginOrSignup: false,
      username: '',
      password: '',
      isLoading: false
    }
  }

  render() {
    const { loginOrSignup, isLoading } = this.state;
    return (
      <div className='row'>
        <div className='col s12 m4 offset-m4'>
          <div className='card'>
            <div className='card-action teal lighten-2 white-text'>
              <h3>Login Form</h3>
            </div>

            <div className='card-content'>
              <div className='form-field'>
                <input type='text' id='username'></input>
                <label htmlFor='username'>Username</label>
              </div><br></br>

              <div className='form-field'>
                <input type='text' id='password'></input>
                <label htmlFor='password'>Password</label>
              </div><br></br>

              <div className="switch">
                <label>
                  Login
                  <input onChange={this.loginOrSignupToggle} type="checkbox"></input>
                  <span className="lever"></span>
                  Sign Up
                </label>
              </div><br></br>

              <div className='form-field'>
                <button className='btn-large wave-effect waves-light' style={{ width: '100%' }}>Submit</button>
              </div>

              {isLoading?<div className="progress">
                <div className="indeterminate"></div>
              </div>:null}

            </div>
          </div>
        </div>
      </div>
    )
  };

  loginOrSignupToggle = () => {
    this.setState({ loginOrSignup: !this.state.loginOrSignup })
  }
}

export default Login;