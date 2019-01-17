import React, { Component } from 'react';
import './App.css';
import Header from '../components/Header'
import { Button } from 'react-bootstrap';

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
      email: {
        emailInput: '',
        emailOutput: [],
        isEmailActive: false
      },
      password: {
        passwordInput: '',
        passwordOutput: []
      }


    }
  }
  componentDidMount() {
    // getBreachedEmails()
  }

  render() {
    let { isEmailActive } = this.state.email;
    
    return (
      <div className="App">
        <Header />




      </div>
    );
  }
}

export default App;
