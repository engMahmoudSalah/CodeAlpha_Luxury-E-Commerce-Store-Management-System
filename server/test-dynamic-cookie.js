import express from 'express';
import session from 'express-session';
import http from 'http';

const app = express();
app.set('trust proxy', 1);

app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000
  }
}));

app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] === 'https' || req.secure) {
    req.session.cookie.secure = true;
    req.session.cookie.sameSite = 'none';
  } else {
    req.session.cookie.secure = false;
    req.session.cookie.sameSite = 'lax';
  }
  next();
});

app.get('/login', (req, res) => {
  req.session.user = { id: 1 };
  res.json({ ok: true });
});

const server = app.listen(0, '127.0.0.1', () => {
  const port = server.address().port;
  
  // Test 1: HTTP
  http.request({ port, path: '/login' }, (res) => {
    console.log("HTTP Cookie:", res.headers['set-cookie']);
    
    // Test 2: HTTPS via proxy
    http.request({ port, path: '/login', headers: { 'x-forwarded-proto': 'https' } }, (res2) => {
      console.log("HTTPS Cookie:", res2.headers['set-cookie']);
      server.close();
    }).end();
  }).end();
});
