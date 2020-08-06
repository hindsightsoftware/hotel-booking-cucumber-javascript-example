
const chai = require('chai');
const chaiHttp = require('chai-http');
const { Given, When, Then } = require('cucumber');

const expect = chai.expect;
chai.use(chaiHttp)


function getToken() {
    const result = chai.request(BASE_URL)
        .post('/login')
        .set('Content-type', 'application/json')
        .send({ username: 'admin', password: 'password123' })
        .then(function (res) {
            return JSON.parse(res.text).token
        })
    return result
}

const BASE_URL = 'http://localhost:8080';
const requestBody = {};
let response = null;
let lastBookingId = 0;

Given('a user wants to make a booking with the following details', function (dataTable) {
    const data = dataTable.raw()[0]

    requestBody.firstname = data[0]
    requestBody.lastname = data[1]
    requestBody.totalprice = data[2]
    requestBody.depositpaid = data[3]
    requestBody.bookingdates = {
        checkin: data[4],
        checkout: data[5]
    }
    requestBody.additionalneeds = data[6]
});

When('the booking is submitted by the user', async function () {
    const token = await getToken()

    response = await chai.request(BASE_URL)
        .post('/api/booking')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .send(requestBody)
});

Then('the booking is successfully stored', async function () {
    expect(response).to.have.property('status').to.be.equal(200)
});

Then('shown to the user as stored', function () {
    expect(response.body).to.have.property('id').to.be.at.least(1)
});

Given('Hotel Booking has existing bookings', async function () {
    const token = await getToken()

    requestBody.firstname = 'rose';
    requestBody.lastname = 'boylu';
    requestBody.totalprice = 10;
    requestBody.depositpaid = true;
    requestBody.bookingdates = {
        checkin: "2020-07-24",
        checkout: "2020-07-25"
    }
    requestBody.additionalneeds = "Breakfast"

    response = await chai.request(BASE_URL)
        .post('/api/booking')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .send(requestBody)

    expect(response).to.have.property('status').to.be.equal(200)
    expect(response.body).to.have.property('id')

    let bookingId = response.body.id
    expect(bookingId).to.be.at.least(1)
    lastBookingId = bookingId
});


When('a specific booking is requested by the user', async function () {
    const token = await getToken()

    response = await chai.request(BASE_URL)
        .get(`/api/booking/${lastBookingId}`)
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')

    expect(response).to.have.property('status').to.be.equal(200)
});

Then('the booking is shown', function () {
    expect(response.body).to.have.property('firstname')
    expect(response.body).to.have.property('lastname')
    expect(response.body).to.have.property('totalprice')
    expect(response.body).to.have.property('depositpaid')
    expect(response.body).to.have.property('bookingdates')
    expect(response.body).to.have.property('additionalneeds')

    expect(response.body.bookingdates).to.have.property('checkin')
    expect(response.body.bookingdates).to.have.property('checkout')
});

When('a specific booking is updated by the user', async function () {
    const token = await getToken()

    requestBody.firstname = 'Matus';
    requestBody.lastname = 'Novak';
    requestBody.totalprice = 30;
    requestBody.depositpaid = true;
    requestBody.bookingdates = {
        checkin: "2020-06-24",
        checkout: "2020-07-25"
    }
    requestBody.additionalneeds = "No";

    response = await chai.request(BASE_URL)
        .put(`/api/booking/${lastBookingId}`)
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send(requestBody)

    expect(response).to.have.property('status').to.be.equal(200)
});

Then('the booking is shown to be updated', function () {
    expect(response.body).to.have.property('firstname')
    expect(response.body).to.have.property('lastname')

    expect(response.body.firstname).to.be.equal('Matus')
    expect(response.body.lastname).to.be.equal('Novak')
});

When('a specific booking is deleted by the user', async function () {
    const token = await getToken()

    response = await chai.request(BASE_URL)
        .delete(`/api/booking/${lastBookingId}`)
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')

    expect(response).to.have.property('status').to.be.equal(200)
});


Then('the booking is removed', async function () {
    const token = await getToken()

    response = await chai.request(BASE_URL)
        .get(`/api/booking/${lastBookingId}`)
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')

    expect(response).to.have.property('status').to.be.equal(404)
});