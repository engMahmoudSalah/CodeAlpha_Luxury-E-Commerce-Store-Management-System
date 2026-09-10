import http from 'http';
import { app } from './server.js';
import { db, initDatabase } from './config/database.js';

initDatabase();

const server = app.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  console.log(`Server started on port ${port} with NODE_ENV=${process.env.NODE_ENV}`);
  
  const req = http.request({
    hostname: '127.0.0.1',
    port,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (res) => {
    console.log("Cookies received:", res.headers['set-cookie']);
    server.close();
  });
  
  req.write(JSON.stringify({ name: 'LocalHTTP', email: `local_${Date.now()}@example.com`, password: 'password123' }));
  req.end();
});
