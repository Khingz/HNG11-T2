require('dotenv').config();
const { app } = require('../app');
const request = require('supertest');
const { verifyToken } = require('../middleware/auth/auth');
const db = require('../models');
const { getSingleOrganisation } = require('../controllers/organisation.controller');
const CustomError = require('../middleware/error/customError');

// {---------------------------------- UNITTEST SECTION -------------------------------------------}

// Test Token generation

describe('Token Generaion', () => {
    test('Correct token created successfully', async() => {
        const claims = {id: '123'}
        const jwt = require('jsonwebtoken');
        const accessToken = await jwt.sign(claims, process.env.JWT_ACCESS_SECRET, {expiresIn: '30s'});
        const decoded = await verifyToken(accessToken, process.env.JWT_ACCESS_SECRET);
        expect(decoded).toEqual({
            ...claims,
            iat: expect.any(Number),
            exp: expect.any(Number)
        })
    })

    test('Error thrown, wrong claims', async() => {
        const claims = {id: '123'}
        const jwt = require('jsonwebtoken');
        try {
            const accessToken = await jwt.sign({claim: 'wrong claim'}, process.env.JWT_ACCESS_SECRET, {expiresIn: '30s'});
        } catch (err) {
            expect(err instanceof jwt.JsonWebTokenError).toBeTruthy();
        }
        
    })

    test('Token expires after set time', async() => {
        const CustomError = require('../middleware/error/customError');
        const claims = {id: '123'}
        const jwt = require('jsonwebtoken');
        const accessToken = await jwt.sign(claims, process.env.JWT_ACCESS_SECRET, {expiresIn: '2s'});

        await new Promise(resolve => setTimeout(resolve, 2500)); // Wait for 6 seconds

        try {
            await verifyToken(accessToken, process.env.JWT_ACCESS_SECRET);
        } catch (err) {
            expect(err instanceof CustomError).toBeTruthy();
            expect(err.message).toEqual('Access Denied! Invalid token');
            expect(err.statusCode).toEqual(403);
        }
        
    })
})


// Test Organisation retrieval

describe('Test organisation', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: { orgId: 1 },
            userId: 1
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    test('User has orgnaisation', async () => {
        const mockOrganisation = {
            get: jest.fn().mockReturnValue({
                orgId: 1,
                name: 'Org 1',
                description: 'Description 1',
                users: [{ userId: 1 }]
            })
        };
        db.Organisation.findOne = jest.fn().mockResolvedValue(mockOrganisation);

        await getSingleOrganisation(req, res, next);

        expect(db.Organisation.findOne).toHaveBeenCalledWith({
            where: { orgId: 1 },
            include: [{
                model: db.User,
                as: 'users',
                attributes: ['userId']
            }]
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            message: 'Organisation fetch successfully',
            data: {
                orgId: 1,
                name: 'Org 1',
                description: 'Description 1'
            }
        });
    })


    test('User has no organisation', async () => {
        const mockOrganisation = {
            get: jest.fn().mockReturnValue({
                orgId: 1,
                name: 'Org 1',
                description: 'Description 1',
                users: [{ userId: 2 }]
            })
        };

        db.Organisation.findOne = jest.fn().mockResolvedValue(mockOrganisation);

        await getSingleOrganisation(req, res, next);

        expect(db.Organisation.findOne).toHaveBeenCalledWith({
            where: { orgId: 1 },
            include: [{
                model: db.User,
                as: 'users',
                attributes: ['userId']
            }]
        });

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            status: 'Bad reuest',
            message: 'You are not authorized to get this organisation',
            statusCode: 403
        });
    })


    test('Organisation not found', async () => {
        db.Organisation.findOne.mockResolvedValue(null);

        await getSingleOrganisation(req, res, next);

        expect(next).toHaveBeenCalledWith(new CustomError('No organisation found for the given organisation Id', 404));
    });
})



// {------------------------------------- E2E TEST SECTION -------------------------------------------}

// Test registration functionality

describe('User Registration', () => {
    let originalError, originalLog
    const newUser ={
        firstName: 'testduser',
        lastName: 'testLastname',
        email: 'testuser@example.com',
        password: 'password123',
        phone: '1234'
    }
    beforeAll(() => {
        // Override console.error and console.log to suppress logs
        originalError = console.error;
        console.error = jest.fn();
        originalLog = console.log;
        console.log = jest.fn();
    });

    afterEach(async () => {
        // Cleanup created user and organisation after each test
        await db.User.destroy({ where: { email: newUser.email } });
        await db.Organisation.destroy({ where: { name: `${newUser.firstName}'s Organisation` } });
    });

    test('user register successful', async () => {
        // Delete user with email in db if available
        await db.User.destroy({
            where: {email: newUser.email}
        })

        const response = await request(app)
            .post('/auth/register')
            .send(newUser);


        // Check response data
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Registration successful');
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user.firstName).toEqual(newUser.firstName);
        expect(response.body.data.user.lastName).toEqual(newUser.lastName);
        expect(response.body.data.user.email).toEqual(newUser.email);
        expect(response.body.data.user.phone).toEqual(newUser.phone);

        // Check user is created in database
        const createdUser = await db.User.findOne({ where: { userId: response.body.data.user.userId } });
        expect(createdUser).toBeDefined();
        expect(createdUser.email).toBe(newUser.email);

        // Check default oranisation is created in database
        const createdOrg = await db.Organisation.findOne({ where: { name: `${createdUser.firstName}'s Organisation` } });
        expect(createdOrg).toBeDefined();
        expect(createdOrg.name).toBe(`${createdUser.firstName}'s Organisation`);


        // Check user is added to default organisation
        // const checkUserInOrg = await db.UserOrganisations.findOne({ where: { userId: createdUser.userId, orgId: createdOrg.orgId } });
        // console.log(checkUserInOrg);
        // expect(checkUserInOrg).toBeDefined();
        // expect(checkUserInOrg.orgId).toBe(createdOrg.orgId);
        // expect(checkUserInOrg.userId).toBe(response.body.data.user.userId);
    })

    test('model constraint error', async () => {
        const newUser ={
            firstName: 'testuserr',
            lastName: 'testLastname',
            password: 'password123'
        }

        try {
            const response = await request(app)
            .post('/auth/register')
            .send(newUser);
        } catch(err) {
            expect(err instanceof SequelizeValidationError).toBeTruthy();
            expect(response.status).toBe(422);
            expect(typeof response.body).toBe('object');
            expect(response.body).toHaveProperty('errors');
        }
    });
})


// Test user loggin functionality

describe('User Login', () => { 
    let originalError;
    let originalLog;

    const newUser2 ={
        firstName: 'test2user',
        lastName: 'testLastname',
        email: 'test2user@example.com',
        password: 'password123',
        phone: '1234'
    }

    beforeAll(async () => {
        // Override console.error and console.log to suppress logs
        originalError = console.error;
        console.error = jest.fn();
        originalLog = console.log;
        console.log = jest.fn();
    });

    afterEach(async () => {
        // Cleanup created user and organisation after each test
        await db.User.destroy({ where: { email: newUser2.email } });
        await db.Organisation.destroy({ where: { name: `${newUser2.firstName}'s Organisation` } });
    });

    test('Correct login', async () => {
        // Delete user with email in db if available
        await db.User.destroy({
            where: {email: newUser2.email}
        })

        resp = await request(app)
        .post('/auth/register')
        .send(newUser2);
        const createdOrg = await db.Organisation.findOne({ where: { name: `${resp.body.data.user.firstName}'s Organisation` } });
        const isLoggedIn = await request(app)
        .post('/auth/login')
        .send({email: newUser2.email, password: newUser2.password});

        //check data response
        expect(isLoggedIn.status).toBe(201);
        expect(isLoggedIn.body).toHaveProperty('message', 'Login successful');
        expect(isLoggedIn.body).toHaveProperty('status', 'success');
        expect(isLoggedIn.body).toHaveProperty('data');
        expect(isLoggedIn.body.data).toHaveProperty('accessToken');
        expect(isLoggedIn.body.data).toHaveProperty('user');
        expect(isLoggedIn.body.data.user.firstName).toEqual(newUser2.firstName);
        expect(isLoggedIn.body.data.user.lastName).toEqual(newUser2.lastName);
        expect(isLoggedIn.body.data.user.email).toEqual(newUser2.email);
        expect(isLoggedIn.body.data.user.phone).toEqual(newUser2.phone);
    
    })

    test('Incorrect cedentials', async () => {
        const isLoggedIn = await request(app)
        .post('/auth/login')
        .send({email: 'email', password: 'wrong password'});

        //check response
        expect(isLoggedIn.status).toBe(401);
        expect(isLoggedIn.body).toHaveProperty('status', 'Bad request');
        expect(isLoggedIn.body).toHaveProperty('message', 'Authentication failed');
        expect(isLoggedIn.body).toHaveProperty('statusCode', 401);
    })

    afterAll(async () => {
        await db.sequelize.close(); // Close Sequelize connection
    })
 })