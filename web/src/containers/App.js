import React, { Component } from 'react';
import './App.css';
import Header from '../components/Header'
import { Button, Jumbotron} from 'react-bootstrap';

const getBreachedEmails = () => {
  fetch(`http://localhost:4000/api/email/test`)
    .then(res => res.json())
    .then(res => console.log(JSON.parse(res)))
    .catch(err => console.log(err))
}

class App extends Component {
  constructor() {
    super()
    this.state = {
        isEmailActive: true,
        emailInput: '',
        emailOutput: [],

        passwordInput: '',
        passwordOutput: [],
        isPasswordActive: false
    }
  }
  componentDidMount() {
    // getBreachedEmails()
  }
  
  activeEmailToggle = () => {
    this.setState({ isEmailActive: true, isPasswordActive: false});
  }

  activePasswordToggle = () => {
    this.setState({ isEmailActive: false, isPasswordActive: true});

  }
  
  render() {
    let { isEmailActive, isPasswordActive } = this.state;
    return (
      <div className="App">
        <Header />
        <div className="mainBody">
          <Button onClick={this.activeEmailToggle} bsStyle={isEmailActive?'success':'info'} block bsSize="large">Email</Button>
          <Button onClick={this.activePasswordToggle} bsStyle={isPasswordActive?'success':'info'} block bsSize="large">Password</Button>

          <Jumbotron>
            {isEmailActive?
            <div>
              <h1> Enter Email </h1>
              <form className="form">
                <label value="Email"></label>
                <input className="input" placeholder="Email"></input>
                <Button onClick="" bsStyle ="primary" bsSize="large">Search</Button>
              </form>
            </div>
            :
            <div>
              <h1> Enter Password </h1>
              <form className="form">
                <label value="Password"></label>
                <input className="input" placeholder="Password"></input>
              </form>
                <Button onClick="" bsStyle ="primary" bsSize="large">Search</Button>
            </div>
            }
          </Jumbotron>
        </div>



      </div>
    );
  }
}

export default App;
