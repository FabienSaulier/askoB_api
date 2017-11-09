// combine routes
import lapin from './lapin';
import webhook from './webhook';

export default(server) => {
  lapin(server);
  webhook(server);
};
