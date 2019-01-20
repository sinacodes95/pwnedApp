import React, { Component } from 'react';

class Password extends Component {
  constructor() {
    super()
    this.state = {
      passwordInput: '',
      passwordOutput: '',
      passwordNotFound: '2'
    }
  }

  render() {
    const { passwordOutput, passwordNotFound } = this.state;
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
          {passwordOutput.length && passwordNotFound==='0' ?
              <div className="col s12 m6">
                <div className="card blue-grey darken-1">
                  <div className="card-content white-text">
                    <span className="card-title">Oh! Nooo!</span>
                    <p>Your password was found in {passwordOutput} breaches! <i className="material-icons prefix">sentiment_very_dissatisfied</i></p>
                  </div>
                  <div className="card-action">
                    <a href="#">close</a>
                  </div>
                </div>
              </div>
              :passwordNotFound==='1'?
              <div className="col s12 m6">
                <div className="card blue-grey darken-1">
                  <div className="card-content white-text">
                    <span className="card-title">Wohoo!</span>
                    <p>Your password was not found in any breaches! <i className="material-icons prefix">sentiment_very_satisfied</i></p>
                  </div>
                  <div className="card-action">
                    <a href="#">close</a>
                  </div>
                </div>
              </div>
            :null}
        </div>
      </div>
    );
  }

  passwordInput = (event) => {
    this.setState({ passwordInput: event.target.value });
  }

  getBreachedPassword = async () => {
    this.setState({ passwordNotFound: '2', passwordOutput: '' })
    let password = this.state.passwordInput;
    const passwordHash = (await this.sha1Generator(password)).toUpperCase();
    fetch(`http://localhost:4000/api/password/${passwordHash.slice(0, 5)}`)
      .then(res => res.json())
      .then(res => {
        const rows = res.split('\r\n');
        const found = rows.find(val => val.split(':')[0] === passwordHash.slice(5));
        if (found && found.split(':')[1] > 0) {
          this.setState({ passwordOutput: found.split(':')[1], passwordNotFound: '0' })
        }
        else {
          this.setState({ passwordNotFound: '1' })
        }
      })
      .catch(err => {
        if (err) {
          this.setState({ passwordNotFound: '1' })
        }
      });
  }

  sha1Generator = async (passwordString) => {
    const result = [];
    const buffer = new TextEncoder().encode(passwordString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer)
    const bytes = new DataView(hashBuffer)
    for (let i = 0; i < bytes.byteLength; i += 4) {
      const hexValue = bytes.getUint32(i).toString(16);
      result.push(hexValue);
    }
    return result.join('');
  }
}

export default Password;