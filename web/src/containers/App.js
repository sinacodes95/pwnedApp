import React, { Component } from 'react';
import './App.css';
import Header from '../components/Header'
import InputFields from '../components/InputFields'
import { Button, Jumbotron} from 'react-bootstrap';

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


  getBreachedEmails = () => {
    this.setState({emailOutput: []});

    let emails = this.state.emailInput;
    emails = emails.replace(/\s/g, '')
    emails = emails.match(/,/g)?emails.split(','):[emails];

    emails.forEach(element => {
      if (emails.length) {
        fetch(`http://localhost:4000/api/email/${element}`)
          .then(res => res.json())
          .then(res => JSON.parse(res))
          .then(res => {
            res['email'] = element;
            return res;
          })
          .then(res => this.setState({ emailOutput: [...this.state.emailOutput, res] }))
          .catch(err => console.log(err))
      }
    });
  }
  
  activeEmailToggle = () => {
    this.setState({ isEmailActive: true, isPasswordActive: false});
  }

  emailInput = (event) => {
    this.setState({emailInput: event.target.value})
  }




  activePasswordToggle = () => {
    this.setState({ isEmailActive: false, isPasswordActive: true});

  }
  
  render() {
    let { isEmailActive, isPasswordActive, emailOutput } = this.state;
    return (
      <div className="App">
        <Header />
        <div className="mainBody">
          <Button onClick={this.activeEmailToggle} bsStyle={isEmailActive?'success':'info'} block bsSize="large">Email</Button>
          <Button onClick={this.activePasswordToggle} bsStyle={isPasswordActive?'success':'info'} block bsSize="large">Password</Button>
          

          <Jumbotron>
            {isEmailActive?
            <InputFields title="Enter Email" subTitle="Enter an email or a list of comma separated emails" onChange={this.emailInput} onClick={this.getBreachedEmails}/>
            :
            <div>
              <h1> Enter Password </h1>
              <form className="form">
                <label value="Password"></label>
                <input className="input" placeholder="Password"></input>
                <Button onClick="" bsStyle ="primary" bsSize="large">Search</Button>
              </form>
            </div>
            }
          </Jumbotron>


          <div>
            {isEmailActive&&emailOutput.length?emailOutput.map((v, i) => {
              return (
                <div key={i}>
                  <h1>Results: </h1>
                  <h2>{v.email}</h2>
                  {
                    v.Breaches.map((v, i) => {
                      return (
                        <div key={i} className="resultCard">
                          <p>PwnCount: {v.PwnCount}</p>
                          <p>Name: {v.Name}</p>
                          <p>Title: {v.Title}</p>
                          <p>Domain: {v.Domain}</p>
                          <p>BreachDate: {v.BreachDate}</p>
                        </div>
                      )
                    })
                  }
                  
                </div>
              )
            }):
            <h1>Results: </h1>}
          </div>


        </div>
      </div>
    );
  }
}

export default App;
