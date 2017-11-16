import lapin from './lapin';
import webhook from './webhook';

// combine routes
export default(server) => {
  lapin(server);
  webhook(server);
};
