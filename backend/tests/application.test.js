import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.JWT_SECRET = 'application-route-test-secret-with-more-than-32-characters';

const [{ default: express }, { default: User }, { default: Internship }, { default: Application }, { default: applicationsRouter }, { signToken }] = await Promise.all([
  import('express'),
  import('../models/User.js'),
  import('../models/Internship.js'),
  import('../models/Application.js'),
  import('../routes/applications.js'),
  import('../utils/token.js')
]);

const candidateId = '68b000000000000000000001';
const internshipId = '68b000000000000000000002';
const internship = {
  _id: internshipId,
  id: internshipId,
  status: 'active',
  postedBy: '68b000000000000000000003',
  deadline: null
};
const candidate = { _id: candidateId, id: candidateId, role: 'user' };
const token = signToken(candidate);
let applications;
let server;
let baseUrl;

const originalUserFindById = User.findById;
const originalInternshipFindById = Internship.findById;
const originalApplicationFindOne = Application.findOne;
const originalApplicationCreate = Application.create;
const originalApplicationFind = Application.find;

before(async () => {
  User.findById = () => ({ select: async () => candidate });
  Internship.findById = async id => String(id) === internshipId ? internship : null;
  Application.findOne = async ({ applicant, internship: listing }) =>
    applications.find(item => item.applicant === applicant && item.internship === listing) || null;
  Application.create = async record => {
    if (applications.some(item => item.applicant === record.applicant && item.internship === record.internship)) {
      const error = new Error('duplicate application');
      error.code = 11000;
      throw error;
    }
    const created = { _id: '68b000000000000000000004', ...record, status: 'submitted', createdAt: new Date() };
    applications.push(created);
    return created;
  };
  Application.find = filter => ({
    populate() {
      return this;
    },
    sort() {
      return Promise.resolve(applications.filter(item => item.applicant === filter.applicant));
    }
  });

  const app = express();
  app.use(express.json());
  app.use('/api/applications', applicationsRouter);
  app.use((error, _req, res, _next) => res.status(500).json({ message: error.message }));
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/applications`;
});

beforeEach(() => {
  applications = [];
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
  User.findById = originalUserFindById;
  Internship.findById = originalInternshipFindById;
  Application.findOne = originalApplicationFindOne;
  Application.create = originalApplicationCreate;
  Application.find = originalApplicationFind;
});

test('authenticated candidate application is stored and returned by My Applications', async () => {
  const response = await fetch(`${baseUrl}/${internshipId}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ coverLetter: 'I am excited to learn with this team.' })
  });
  const result = await response.json();

  assert.equal(response.status, 201);
  assert.equal(result.application.applicant, candidateId);
  assert.equal(result.application.internship, internshipId);
  assert.equal(applications.length, 1);

  const myApplications = await fetch(`${baseUrl}/mine`, { headers: { authorization: `Bearer ${token}` } });
  const mine = await myApplications.json();
  assert.equal(myApplications.status, 200);
  assert.equal(mine.items.length, 1);
  assert.equal(mine.items[0]._id, result.application._id);
});

test('duplicate application returns a clear conflict response', async () => {
  const request = () => fetch(`${baseUrl}/${internshipId}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ coverLetter: 'I am excited to learn with this team.' })
  });
  assert.equal((await request()).status, 201);
  const duplicate = await request();
  assert.equal(duplicate.status, 409);
  assert.match((await duplicate.json()).message, /already applied/i);
  assert.equal(applications.length, 1);
});

test('a concurrent duplicate insert is converted to a conflict response', async () => {
  const originalFindOne = Application.findOne;
  const originalCreate = Application.create;
  Application.findOne = async () => null;
  Application.create = async () => {
    const error = new Error('duplicate application index');
    error.code = 11000;
    throw error;
  };
  try {
    const response = await fetch(`${baseUrl}/${internshipId}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ coverLetter: 'I am excited to learn with this team.' })
    });
    assert.equal(response.status, 409);
    assert.match((await response.json()).message, /already applied/i);
  } finally {
    Application.findOne = originalFindOne;
    Application.create = originalCreate;
  }
});

test('application note is required and authentication is enforced', async () => {
  const missingNote = await fetch(`${baseUrl}/${internshipId}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ coverLetter: '   ' })
  });
  assert.equal(missingNote.status, 400);
  assert.equal(applications.length, 0);

  const unauthenticated = await fetch(`${baseUrl}/${internshipId}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ coverLetter: 'I am excited to learn with this team.' })
  });
  assert.equal(unauthenticated.status, 401);
  assert.equal(applications.length, 0);
});
