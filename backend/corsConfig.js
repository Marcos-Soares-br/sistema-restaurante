import cors from 'cors';

const corsOptions = {
  origin: 'https://recanto-do-sul.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
