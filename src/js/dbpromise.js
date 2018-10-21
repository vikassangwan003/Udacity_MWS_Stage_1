import idb from 'idb';

const dbPromise = {
  // creation and updating of database happens here.
  db: idb.open('restaurant-reviews-db', 1, function (upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
    }
  }),

  /**
   * Save a restaurant or array of restaurants into idb, using promises.
   */
  putRestaurants(restaurants) {
    if (!restaurants.push) restaurants = [restaurants];
    return this.db.then(db => {
      const store = db.transaction('restaurants', 'readwrite').objectStore('restaurants');
      Promise.all(restaurants.map(networkRestaurant => {
        return store.get(networkRestaurant.id).then(idbRestaurant => {
          if (!idbRestaurant || networkRestaurant.updatedAt > idbRestaurant.updatedAt) {
            return store.put(networkRestaurant);  
          } 
        });
      })).then(function () {
        return store.complete;
      });
    });
  },

  /**
   * Get a restaurant, by its id, or all stored restaurants in idb using promises.
   * If no argument is passed, all restaurants will returned.
   */
   // default undefined
  getRestaurants(id = undefined) {
     // this.db is database we creted
	return this.db.then(db => {
      //open a store transaction for restaurant as default readonly
	  const store = db.transaction('restaurants').objectStore('restaurants');
      // if id passed to restaurant then return restaurant by id
	  // if nothing is passed then return all restaurants
	  if (id) return store.get(Number(id));
      return store.getAll();
    });
  },

};


export default dbPromise;

