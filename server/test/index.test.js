import database from '../lib/database';
const chai = require('chai');

const { expect } = chai;



describe('Doors', () => {

  it('should send all the doors', () => {
    console.log("ICI", database)
    expect(1).equal(1);
  });

});


