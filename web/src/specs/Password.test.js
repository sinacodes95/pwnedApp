import React from 'react';
import Password from '../containers/Password';
import Enzyme, {shallow } from 'enzyme';

it('it shallow renders correctly', () => {
  const wrapper = shallow(
    <Password />
  );

  expect(wrapper).toMatchSnapshot();
});

it('renders elements with "card" class', () => {
  const wrapper = shallow(<Password />);
  expect(wrapper.find('input').first().hasClass('validate')).toBe(true);
});

it('has a sha1Generator method', () => {
  const wrapper = shallow(<Password />);
  const result = wrapper.instance().sha1Generator('test')
  expect(result).toBe('a94a8fe5ccb19ba61c4c0873d391e987982fbbd3') 
})

it('sha1Generator method return a sha1 hash', () => {
  const resObj = "{\r\nfe5ccb19ba61c4c0873d391e987982fbbd3:1\r\nfe5ccb19ba61c4c0873d391e987982fbbd2:2\r\nfe5ccb19ba61c4c0873d391e987982fbbd4:3\r\nfe5ccb19ba61c4c0873d391e987982fbbd5:4\r\n}"
  const wrapper = shallow(<Password />);
  const result = wrapper.instance().findHash('a94a8fe5ccb19ba61c4c0873d391e987982fbbd3', resObj)
  expect(result).toEqual('fe5ccb19ba61c4c0873d391e987982fbbd3:1') 
})

it('state properties', () => {
  const wrapper = shallow(<Password />);
  wrapper.state();
  expect(wrapper.state()).toEqual({"passwordInput": "", "passwordNotFound": "2", "passwordOutput": ""});
});