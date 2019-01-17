import React from 'react';
import { Button } from 'react-bootstrap';
import './InputFields.css'


const InputFields = (props) => {
  let {title, subTitle, onChange, onClick} = props;
  return (
    <div>
      <h1> {title} </h1>
      <p>{subTitle}</p>
      <form className="form">
        <label value="Email"></label>
        <input onChange={onChange} className="input" placeholder="Email"></input>
        <Button onClick={onClick} bsStyle ="primary" bsSize="large">Search</Button>
      </form>
    </div>
  )
};

export default InputFields;