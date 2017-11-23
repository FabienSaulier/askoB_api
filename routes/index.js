import lapin from './lapin';
import species from './species';
import webhook from './webhook';

// combine routes
export default(server) => {
  lapin(server);
  species(server)
  webhook(server);
};
