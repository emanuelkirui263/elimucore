import client from './client';

export const authAPI = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  getCurrentUser: () => client.get('/auth/me'),
  changePassword: (oldPassword, newPassword) =>
    client.post('/auth/change-password', { oldPassword, newPassword }),
  refreshToken: () => client.post('/auth/refresh'),
};

export const studentAPI = {
  createStudent: (data) => client.post('/students', data),
  getStudents: (params) => client.get('/students', { params }),
  getStudent: (id) => client.get(`/students/${id}`),
  updateStudent: (id, data) => client.put(`/students/${id}`, data),
  approveStudent: (id) => client.post(`/students/${id}/approve`),
};

export const academicsAPI = {
  createExam: (data) => client.post('/academics/exams', data),
  createSubject: (data) => client.post('/academics/subjects', data),
  enterMarks: (data) => client.post('/academics/marks', data),
  getResults: (studentId) => client.get(`/academics/results/${studentId}`),
  getRankings: (examId, classLevel) =>
    client.get(`/academics/rankings/class/${examId}/${classLevel}`),
  approveMarks: (id) => client.post(`/academics/marks/${id}/approve`),
  lockExam: (id) => client.post(`/academics/exams/${id}/lock`),
};

export const financeAPI = {
  createFeeStructure: (data) =>
    client.post('/finance/fee-structures', data),
  getStudentAccount: (studentId) =>
    client.get(`/finance/accounts/${studentId}`),
  recordPayment: (data) => client.post('/finance/payments', data),
  verifyPayment: (id) => client.post(`/finance/payments/${id}/verify`),
  getPaymentReport: (params) =>
    client.get('/finance/reports/payments', { params }),
  getArrears: () => client.get('/finance/arrears'),
};

export const attendanceAPI = {
  recordAttendance: (data) => client.post('/attendance', data),
  bulkAttendance: (records) => client.post('/attendance/bulk', { records }),
  getReport: (studentId, params) =>
    client.get(`/attendance/report/${studentId}`, { params }),
};
