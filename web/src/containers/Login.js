import React, { Component } from 'react'

class Login extends Component {
  constructor() {
    super();
    this.state = {
      loginOrSignup: false,
      username: '',
      password: '',
      isLoading: false,
      loggedIn: false,
      comingSoon: false
    }
  }

  render() {
    const { isLoading, comingSoon } = this.state;
    return (
      <div className='row'>
        <div className='col s12 m4 offset-m4'>
          <div className='card'>
            <div className='card-action teal lighten-2 white-text'>
              <h3>Login Form</h3>
            </div>

            <div className='card-content'>
              <div className='form-field'>
                <input onChange={this.username}type='text' id='username'></input>
                <label htmlFor='username'>Username</label>
              </div><br></br>

              <div className='form-field'>
                <input onChange={this.password} type='password' id='password'></input>
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
                <button onClick={this.handleLogin} className='btn-large wave-effect waves-light' style={{ width: '100%' }}>Submit</button>
              </div>

              {isLoading?<div className="progress">
                <div className="indeterminate"></div>
              </div>:null}

            </div>
          </div>
        </div>
        {comingSoon?
          <div className='col s12 m4 offset-m4'>
            <div className='card'>
              <div className='card-action teal lighten-2 white-text'>
                <p>Thank you for showing an interest in our product.</p>
                <p>This feature is coming soon!</p>
              </div>
            </div>
          </div>:null}
      </div>
    )
  };

  username = (e) => {
    this.setState({username: e.target.value})
  }

  password = (e) => {
    this.setState({password: e.target.value})
  }

  loginOrSignupToggle = () => {
    this.setState({ loginOrSignup: !this.state.loginOrSignup })
  }

  handleLogin = (e) => {
    e.preventDefault();
    this.setState({comingSoon: true});
    
  };

}

export default Login;