import React, { Component } from 'react';
import crypto from 'crypto';

class Password extends Component {
  constructor() {
    super()
    this.state = {
      passwordInput: '',
      passwordOutput: '',
      passwordNotFound: '2',
      isLoading: false

    }
  }

  render() {
    const { passwordOutput, passwordNotFound, isLoading } = this.state;
    return (
      <div className='container'>
        <div className="row">
          <div className="col s12 m6">
            <div className="card blue-grey darken-1">
              <div className="card-content white-text">
                <span className="card-title">Password</span>
                <p>Enter your password below to check if it was compromised in a data breach.</p>
                <br></br>
                <br></br>
                <div className="row">
                  <form className="col s12">
                    <div className="row">
                      <div className="input-field col s11 m11">
                        <i className="material-icons prefix">confirmation_number</i>
                        <input onChange={this.passwordInput} id="password" type="password" className="validate"></input>
                        <label htmlFor="password">Enter password</label>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="card-action">
                <a onClick={this.getBreachedPassword} href="#">search</a>
              </div>
            </div>
          </div>
          {isLoading ? <div className="progress">
            <div className="indeterminate"></div>
          </div> :
            passwordOutput.length && passwordNotFound === '0' ?
              <div className="col s12 m6">
                <div className="card red darken-1">
                  <div className="card-content white-text">
                    <span className="card-title">Oh! Nooo!</span>
                    <p>Your password was found in {passwordOutput} breaches! <i className="material-icons prefix">sentiment_very_dissatisfied</i></p>
                  </div>
                  <div className="card-action">
                    <a onClick={this.closeCard} href="#">close</a>
                  </div>
                </div>
              </div>
              : passwordNotFound === '1' ?
                <div className="col s12 m6">
                  <div className="card teal accent-3">
                    <div className="card-content white-text">
                      <span className="card-title">Wohoo!</span>
                      <p>Your password was not found in any breaches! <i className="material-icons prefix">sentiment_very_satisfied</i></p>
                    </div>
                    <div className="card-action">
                      <a onClick={this.closeCard} href="#">close</a>
                    </div>
                  </div>
                </div>
                : null}
        </div>
      </div>
    );
  }

  passwordInput = (event) => {
    this.setState({ passwordInput: event.target.value });
  }

  getBreachedPassword = () => {
    this.setState({ passwordNotFound: '2', passwordOutput: '', isLoading: true });
    let password = this.state.passwordInput;
    if (!password.length) {
      this.setState({isLoading: false});
      return;
    }
    const passwordHash = (this.sha1Generator(password)).toUpperCase();
    fetch(`http://localhost:4000/api/password/${passwordHash.slice(0, 5)}`)
      .then(res => res.json())
      .then(res => {
        const found = this.findHash(passwordHash, res);
        if (found && found.split(':')[1] > 0) {
          this.setState({ isLoading: false, passwordOutput: found.split(':')[1], passwordNotFound: '0' })
        }
        else {
          this.setState({ isLoading: false, passwordNotFound: '1' })
        }
      })
      .catch(err => {
        if (err) {
          this.setState({ isLoading: false, passwordNotFound: '1' })
        }
      });
  }

  findHash = (passwordHash, hashes) => {
    const rows = hashes.split('\r\n');
    const found = rows.find(val => val.split(':')[0] === passwordHash.slice(5));
    return found;
  }

  sha1Generator = (passwordString) => {
    return crypto.createHash('sha1').update(passwordString, 'binary').digest('hex');
  }

  closeCard = () => {
    this.setState({ passwordNotFound: '2' })
  }
}

export default Password;