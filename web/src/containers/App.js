import React, { Component } from 'react';
import './App.css';
import NavBar from '../components/NavBar'
import Home from '../components/Home'
import Email from './Email'
import Password from './Password'
import {BrowserRouter, Route} from 'react-router-dom';

class App extends Component {
  constructor() {
    super()
    this.state = {
        isEmailActive: true,
        emailInput: '',
        emailOutput: [],
        emailFound: true,

        passwordInput: '',
        passwordOutput: '',
        isPasswordActive: false,
        passwordFound: true
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
          .catch(err => {
            if (err) {
              this.setState({emailFound: false});              
            }
          })
      }
    });
  }
  
  activeEmailToggle = () => {
    this.setState({ isEmailActive: true, isPasswordActive: false});
  }

  emailInput = (event) => {
    this.setState({emailInput: event.target.value});
  }

  okFound = () => {
    this.setState({emailFound: true});
    this.setState({passwordFound: true});
  }

  passwordInput = (event) => {
    this.setState({passwordInput: event.target.value});
  }

  getBreachedPassword = async () => {
    let password = this.state.passwordInput;
    const passwordHash = (await this.sha1Generator(password)).toUpperCase();
    fetch(`http://localhost:4000/api/password/${passwordHash.slice(0,5)}`)
    .then(res => res.json())
    .then(res => {
      const rows = res.split('\r\n');
      const found = rows.find(val => val.split(':')[0] === passwordHash.slice(5));
      if (found && found.split(':')[1] > 0) {
        this.setState({passwordOutput: found.split(':')[1]})
      }
      else {
        this.setState({passwordFound: false})
      }
    })
    .catch(err => console.log(err));
  }

  sha1Generator = async (passwordString) => {
    const result = [];
    const buffer = new TextEncoder().encode(passwordString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer)
    const bytes = new DataView(hashBuffer)
    for (let i=0;i<bytes.byteLength;i+=4) {
      const hexValue = bytes.getUint32(i).toString(16);
      const padding = '00000000';
      const paddedValue = (padding + hexValue).slice(-padding.length)
      result.push(paddedValue);
    }
    return result.join('');
  }

  activePasswordToggle = () => {
    this.setState({ isEmailActive: false, isPasswordActive: true});

  }
  
  render() {
    let { isEmailActive, isPasswordActive, emailOutput, passwordOutput, emailFound, passwordFound } = this.state;
    return (
      <BrowserRouter>
      <div>
        <NavBar />
          <Route exact path='/' component={Home}></ Route>
          <Route exact path='/Email' component={Email}></ Route>
          <Route exact path='/Password' component={Password}></ Route>
      </div>
      </BrowserRouter>
      



        // <div className="App">
        //   <Header />
        //   <div className="mainBody">
        //     <Button onClick={this.activeEmailToggle} bsStyle={isEmailActive?'success':'info'} block bsSize="large">Email</Button>
        //     <Button onClick={this.activePasswordToggle} bsStyle={isPasswordActive?'success':'info'} block bsSize="large">Password</Button>
            
        //     {!emailFound
        //     ?<Jumbotron>
        //       <h1>Email Not Found In Any Records...For Now!</h1>
        //     <Button onClick={this.okFound} bsStyle="warning" bsSize="small">OK</Button>
        //     </Jumbotron>
        //     :<div></div>}

        //     {!passwordFound
        //     ?<Jumbotron>
        //       <h1>Password Not Found In Any Records...For Now!</h1>
        //     <Button onClick={this.okFound} bsStyle="warning" bsSize="small">OK</Button>            
        //     </Jumbotron>
        //     :<div></div>}

        //     <Jumbotron>
        //       {isEmailActive
        //       ?<InputFields title="Enter Email" subTitle="Enter an email or a list of comma separated emails" onChange={this.emailInput} onClick={this.getBreachedEmails}/>
        //       :<InputFields title="Enter Password" subTitle="Enter password below" onChange={this.passwordInput} onClick={this.getBreachedPassword} inputType="password"/>}
        //       <h1>{passwordOutput}</h1>
        //     </Jumbotron>


        //     <div>
        //       {isEmailActive&&emailOutput.length?emailOutput.map((v, i) => {
        //         return (
        //           <div key={i}>
        //             <h1>Results: </h1>
        //             <h2>{v.email}</h2>
        //             {
        //               v.Breaches.map((v, i) => {
        //                 return (
        //                   <div key={i} className="resultCard">
        //                     <p>PwnCount: {v.PwnCount}</p>
        //                     <p>Name: {v.Name}</p>
        //                     <p>Title: {v.Title}</p>
        //                     <p>Domain: {v.Domain}</p>
        //                     <p>BreachDate: {v.BreachDate}</p>
        //                   </div>
        //                 )
        //               })
        //             }
                    
        //           </div>
        //         )
        //       }):
        //       <div></div>}
        //     </div>

        //     <div>
        //       {isPasswordActive&&passwordOutput.length
        //       ?<h1>Your Password was found in {passwordOutput} breaches!!!!!</h1>
        //       :<div></div>            }
        //     </div>


        //   </div>
        // </div>
    );
  }
}

export default App;
