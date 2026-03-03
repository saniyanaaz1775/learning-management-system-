import app from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});

export default server;
