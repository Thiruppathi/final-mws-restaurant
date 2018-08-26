import DBHelper from './dbhelper';

let restaurants;
let neighborhoods;
let cuisines;
let map;
let markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
	fetchNeighborhoods();
	fetchCuisines();
});

document
	.getElementById('cuisines-select')
	.addEventListener('change', (event) => {
		updateRestaurants();
	});

document
	.getElementById('neighborhoods-select')
	.addEventListener('change', (event) => {
		updateRestaurants();
	});

/**
 * Fetch all neighborhoods and set their HTML.
 */
let fetchNeighborhoods = () => {
	DBHelper.fetchNeighborhoods((error, data) => {
		if (error) {
			console.error(error);
		} else {
			neighborhoods = data;
			fillNeighborhoodsHTML();
		}
	});
};

/**
 * Set neighborhoods HTML.
 */
let fillNeighborhoodsHTML = (data = neighborhoods) => {
	const select = document.getElementById('neighborhoods-select');
	data.forEach((neighborhood, index) => {
		const option = document.createElement('option');
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		option.setAttribute('role', 'option');
		option.setAttribute('aria-posinset', index + 1);
		option.setAttribute('aria-setsize', data.length);
		select.append(option);
	});
};

/**
 * Fetch all cuisines and set their HTML.
 */
let fetchCuisines = () => {
	DBHelper.fetchCuisines((error, data) => {
		if (error) {
			// Got an error!
			console.error(error);
		} else {
			cuisines = data;
			fillCuisinesHTML();
		}
	});
};

/**
 * Set cuisines HTML.
 */
let fillCuisinesHTML = (data = cuisines) => {
	const select = document.getElementById('cuisines-select');

	data.forEach((cuisine, index) => {
		const option = document.createElement('option');
		option.innerHTML = cuisine;
		option.value = cuisine;
		option.setAttribute('role', 'option');
		option.setAttribute('aria-posinset', index + 1);
		option.setAttribute('aria-setsize', cuisines.length);
		select.append(option);
	});
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
	let loc = {
		lat: 40.722216,
		lng: -73.987501,
	};
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: loc,
		scrollwheel: false,
	});
	updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
let updateRestaurants = () => {
	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');

	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;

	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;

	DBHelper.fetchRestaurantByCuisineAndNeighborhood(
		cuisine,
		neighborhood,
		(error, restaurants) => {
			if (error) {
				// Got an error!
				console.error(error);
			} else {
				resetRestaurants(restaurants);
				fillRestaurantsHTML();
			}
		}
	);
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
let resetRestaurants = (data) => {
	// Remove all restaurants
	restaurants = [];
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';

	// Remove all map markers
	markers.forEach((m) => m.setMap(null));
	markers = [];
	restaurants = data;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
let fillRestaurantsHTML = (data = restaurants) => {
	const ul = document.getElementById('restaurants-list');
	data.forEach((restaurant) => {
		ul.append(createRestaurantHTML(restaurant));
	});
	addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
let createRestaurantHTML = (restaurant) => {
	const li = document.createElement('li');

	const picture = document.createElement('picture');
	let imgName = DBHelper.imageUrlForRestaurant(restaurant).split('.jpg')[0];
	const markUp = `<source media='(min-width: 450px)' srcset='${imgName}-medium.jpg'>
                  <source media='(min-width: 365px)' srcset='${imgName}-small.jpg'>
                  <img src='${imgName}-small.jpg' alt='${
		restaurant.alt
	}' class='restaurant-img' />`;
	picture.innerHTML = markUp;
	li.append(picture);

	const name = document.createElement('h3');
	name.innerHTML = restaurant.name;
	li.append(name);

	const neighborhood = document.createElement('p');
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);

	const address = document.createElement('p');
	address.innerHTML = restaurant.address;
	li.append(address);

	const more = document.createElement('a');
	more.innerHTML = 'View Details';
	more.href = DBHelper.urlForRestaurant(restaurant);
	li.append(more);

	return li;
};

/**
 * Add markers for current restaurants to the map.
 */
let addMarkersToMap = (data = restaurants) => {
	data.forEach((restaurant) => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, map);
		google.maps.event.addListener(marker, 'click', () => {
			window.location.href = marker.url;
		});
		markers.push(marker);
	});
};

// self executing function here to set a11y title for Google Map's iFrame
(function() {
	setTimeout(() => {
		let googleMapFrame = document.querySelector('#map iframe');
		if (googleMapFrame) {
			googleMapFrame.title = `Google Map Location for Restaurants`;
		}
	}, 1000);
})();
