import React from 'react';
import Email from '../containers/Email';
import Enzyme, {shallow } from 'enzyme';

it('it shallow renders correctly', () => {
  const wrapper = shallow(
    <Email />
  );

  expect(wrapper).toMatchSnapshot();
});

it('state properties', () => {
  const wrapper = shallow(<Email />);
  wrapper.state();
  expect(wrapper.state()).toEqual({"emailInput": "", "emailNotFound": "", "emailOutput": []});
});

it('renders elements with "card" class', () => {
  const wrapper = shallow(<Email />);
  expect(wrapper.find('textarea').first().hasClass('materialize-textarea')).toBe(true);
});

it('has a splitEmails method and returns and array', () => {
  const wrapper = shallow(<Email />);
  const listString = wrapper.instance().splitEmails('test, test1, test3')
  const oneString = wrapper.instance().splitEmails('test')
  expect(listString).toEqual(["test","test1","test3"]) 
  expect(oneString).toEqual(["test"]) 
})
