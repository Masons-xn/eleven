const { NODE_ENV, HOST, PORT } = process.env;


export default {
  IS_PROD: NODE_ENV === 'production',
  HOST: typeof HOST === 'undefined' ? 'localhost' : HOST,
  PORT: typeof PORT === 'undefined' ? 3001 : parseInt(PORT),
};
