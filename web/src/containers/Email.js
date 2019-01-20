import React, { Component } from 'react';

class Email extends Component {
  constructor() {
    super()
    this.state = {

      emailInput: '',
      emailOutput: [],
      emailNotFound: ''

    }
  }

  render() {
    const { emailOutput, emailNotFound } = this.state;
    return (
      <div className='container'>
        <div className="row">
          <div className="col s12 m4">
            <div className="card grey darken-1">
              <div className="card-content white-text">
                <span className="card-title">Email</span>
                <p>Enter your email address below to check if it was compromised in a data breach.</p>
                <p>You may also enter a list of comma separated emails to check multiple accounts.</p>
                <br></br>
                <br></br>
                <div className="row">
                  <form className="col s12">
                    <div className="row">
                      <div className="input-field col s11 m11">
                        <i className="material-icons prefix">mail</i>
                        <textarea onChange={this.emailInput} id="icon_prefix2" className="materialize-textarea"></textarea>
                        <label htmlFor="icon_prefix2">Enter email</label>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="card-action">
                <a onClick={this.getBreachedEmails} href="#">search</a>
              </div>
            </div>
          </div>
          <div className="col s12 m8">
            {
              emailOutput.length ? emailOutput.map((emailBreach, index) => {
                return (
                  <div key={index} className='white-text'>
                    <h3>{emailBreach.email}<i className="material-icons prefix">do_not_disturb</i></h3>
                    <table>
                      <thead>
                        <tr className='red darken-1'>
                          <th>Name</th>
                          <th>Domain</th>
                          <th>Breach Date</th>
                          <th>Pwnd Count</th>
                        </tr>
                      </thead>
                      {
                        emailBreach.Breaches.map((breach, index) => {
                          return (
                            <tbody key={index}>
                              <tr>
                                <td>{breach.Name}</td>
                                <td>{breach.Domain}</td>
                                <td>{breach.BreachDate}</td>
                                <td>{breach.PwnCount}</td>
                              </tr>
                            </tbody>
                          );
                        })
                      }
                    </table>
                  </div>
                )
              })
              :null}
            {emailNotFound.length ?
              <div className="col s12 m12">
                <div className="card teal accent-3">
                  <div className="card-content white-text">
                    <span className="card-title">Wohoo! no records found for:</span>
                    <i className="material-icons prefix">check_circle</i>
                    {emailNotFound.split(',').map((email, index) => {
                      return (
                        email.length > 5 ? 
                          <p key={index}>{email}</p>
                        :null
                      );
                    })}
                  </div>
                  <div className="card-action">
                    <a onClick={this.closeCard} href="#">close</a>
                  </div>
                </div>
              </div>
              : null}
          </div>
        </div>
      </div>
    );
  }

  emailInput = (event) => {
    this.setState({ emailInput: event.target.value });
  }

  getBreachedEmails = () => {
    this.setState({ emailOutput: [], emailNotFound: '' });

    let emails = this.state.emailInput;
    emails = emails.replace(/\s/g, '')
    emails = emails.match(/,/g) ? emails.split(',') : [emails];

    emails.forEach(element => {
      if (emails.length) {
        fetch(`http://localhost:4000/api/email/${element}`)
          .then(res => {
            console.log(res)
            return res
          })
          .then(res => res.json())
          .then(res => JSON.parse(res))
          .then(res => {
            res['email'] = element;
            return res;
          })
          .then(res => this.setState({ emailOutput: [...this.state.emailOutput, res] }))
          .catch(err => {
            if (err) {
              console.log(err)
              this.setState({ emailNotFound: `${this.state.emailNotFound},${element}` });
            }
          })
      }
    });
  }

  closeCard = () => {
    this.setState({ emailNotFound: '' })
  }

}

export default Email;