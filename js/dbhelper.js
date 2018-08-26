import idb from 'idb';
let dbPromise;

/**
 * Common database helper functions.
 */
class DBHelper {
	/**
	 * Database URL.
	 * Change this to restaurants.json file location on your server.
	 */
	static get DATABASE_URL() {
		const port = 1337; // Change this to your server port
		return `http://localhost:${port}/restaurants`;
	}

	/**
	 * Open Index Database (IDB)
	 * @return {object} Promise Object for IDB
	 */
	static openIDB() {
		return idb.open('restaurants', 1, (upgradeDb) => {
			upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
		});
	}

	/**
	 * Get cached restaurants from IDB.
	 * network-first appraoch for fetching restaturants.
	 *
	 * @return {object} Restaurants
	 */
	static getCachedRestaurants() {
		dbPromise = DBHelper.openIDB();
		return dbPromise.then(function(db) {
			if (!db) return;

			let tx = db.transaction('restaurants');
			let restaurants = tx.objectStore('restaurants');
			return restaurants.getAll();
		});
	}

	/**
	 * Update restaurants in IDB.
	 * network-first appraoch for fetching restaturants.
	 * @param {Object} data
	 * @return {void}
	 */
	static updateRestaurantStore(data) {
		dbPromise.then(function(db) {
			if (!db) return db;

			let tx = db.transaction('restaurants', 'readwrite');
			let restaurantStore = tx.objectStore('restaurants');

			data.forEach((restaurant) => restaurantStore.put(restaurant));
		});
	}

	/**
	 * Fetch all restaurants.
	 * @param {function} callback
	 * @return {void}
	 */
	static fetchRestaurants(callback) {
		DBHelper.getCachedRestaurants().then(function(data) {
			if (data.length > 0) {
				return callback(null, data);
			}

			fetch(DBHelper.DATABASE_URL, {credentials: 'same-origin'})
				.then((response) => response.json())
				.then((data) => {
					dbPromise.then(function(db) {
						if (!db) return db;
						console.log('data fetched is: ', data);

						let tx = db.transaction('restaurants', 'readwrite');
						let restaurantStore = tx.objectStore('restaurants');
						debugger;
						data.forEach((restaurant) => restaurantStore.put(restaurant));
					});
					return callback(null, data);
				})
				.catch((err) => {
					return callback(err, null);
				});
		});
	}

	/**
	 * Fetch a restaurant by its ID.
	 * @param {Number} id
	 * @param {function} callback
	 * @return {void}
	 */
	static fetchRestaurantById(id, callback) {
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				const restaurant = restaurants.find((r) => r.id == id);
				if (restaurant) {
					// Got the restaurant
					callback(null, restaurant);
				} else {
					// Restaurant does not exist in the database
					callback('Restaurant does not exist', null);
				}
			}
		});
	}

	/**
	 * Fetch restaurants by a cuisine type with proper error handling.
	 * @param {String} cuisine
	 * @param {function} callback
	 * @return {void}
	 */
	static fetchRestaurantByCuisine(cuisine, callback) {
		// Fetch all restaurants  with proper error handling
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given cuisine type
				const results = restaurants.filter((r) => r.cuisine_type == cuisine);
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch restaurants by a neighborhood with proper error handling.
	 * @param {String} neighborhood
	 * @param {function} callback
	 * @return {void}
	 */
	static fetchRestaurantByNeighborhood(neighborhood, callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given neighborhood
				const results = restaurants.filter(
					(r) => r.neighborhood == neighborhood
				);
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch restaurants by a cuisine & a neighborhood with proper error handling.
	 * @param {String} cuisine
	 * @param {String} neighborhood
	 * @param {function} callback
	 * @return {void}
	 */
	static fetchRestaurantByCuisineAndNeighborhood(
		cuisine,
		neighborhood,
		callback
	) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				let results = restaurants;
				if (cuisine != 'all') {
					// filter by cuisine
					results = results.filter((r) => r.cuisine_type == cuisine);
				}
				if (neighborhood != 'all') {
					// filter by neighborhood
					results = results.filter((r) => r.neighborhood == neighborhood);
				}
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch all neighborhoods with proper error handling.
	 * @param {function} callback
	 * @return {void}
	 */
	static fetchNeighborhoods(callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all neighborhoods from all restaurants
				const neighborhoods = restaurants.map(
					(v, i) => restaurants[i].neighborhood
				);
				// Remove duplicates from neighborhoods
				const uniqueNeighborhoods = neighborhoods.filter(
					(v, i) => neighborhoods.indexOf(v) == i
				);
				callback(null, uniqueNeighborhoods);
			}
		});
	}

	/**
	 * Fetch all cuisines with proper error handling.
	 * @param {function} callback
	 * @return {void}
	 */
	static fetchCuisines(callback) {
		// Fetch all restaurants
		DBHelper.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all cuisines from all restaurants
				const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
				// Remove duplicates from cuisines
				const uniqueCuisines = cuisines.filter(
					(v, i) => cuisines.indexOf(v) == i
				);
				callback(null, uniqueCuisines);
			}
		});
	}

	/**
	 * Restaurant page URL.
	 * @param {Object} restaurant
	 * @return {String} URL for Restaurant
	 */
	static urlForRestaurant(restaurant) {
		return `./restaurant.html?id=${restaurant.id}`;
	}

	/**
	 * Restaurant image URL.
	 * @param {Object} restaurant
	 * @return {String} Image URL for Restaurant
	 */
	static imageUrlForRestaurant(restaurant) {
		return `/images/${restaurant.photograph || 10}`;
	}

	/**
	 * Map marker for a restaurant.
	 * @param {Object} restaurant
	 * @param {Object} map
	 * @return {Object} Map Marker for restaurant
	 */
	static mapMarkerForRestaurant(restaurant, map) {
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: DBHelper.urlForRestaurant(restaurant),
			map: map,
			animation: google.maps.Animation.DROP,
		});
		return marker;
	}
}

module.exports = DBHelper;
