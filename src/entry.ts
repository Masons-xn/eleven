import logger from './core/logger';
import secrets from './core/secrets';
import server from './server';
import uncaughtException from './core/uncaughtException';
// import scoket from './core/socket'
async function main() {
  await server.listen({ port: secrets.PORT, host: secrets.HOST });
  logger.info(`Running at http://${secrets.HOST}:${secrets.PORT}`);
}
// scoket()
// process.on('unhandledRejection', (err) => {
//   if (err) {
//     logger.error(err);
//   }
// });

process.on('uncaughtException', function (err) {
  uncaughtException.error(JSON.stringify(err.stack))
  logger.error(JSON.stringify(err));
})

main();
