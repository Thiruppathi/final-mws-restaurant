import DBHelper from './dbhelper';

let restaurant;
let map;

document.getElementById('addReviewBtn').addEventListener('click', event => {
	console.log('Clicked');
	addReview(event);
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
	fetchRestaurantFromURL((error, data) => {
		if (error) {
			console.error(error);
		} else {
			map = new google.maps.Map(document.getElementById('map'), {
				zoom: 16,
				center: data.latlng,
				scrollwheel: false
			});
			fillBreadcrumb();
			DBHelper.mapMarkerForRestaurant(data, map);
		}
	});
};

/**
 * Get current restaurant from page URL.
 */
let fetchRestaurantFromURL = callback => {
	if (restaurant) {
		// restaurant already fetched!
		callback(null, restaurant);
		return;
	}
	const id = parseInt(getParameterByName('id'));
	if (!id || id === NaN) {
		// no id found in URL
		let error = 'No restaurant id in URL';
		callback(error, null);
	} else {
		DBHelper.fetchRestaurantById(id, (error, data) => {
			restaurant = data;
			if (!data) {
				console.error(error);
				return;
			}
			fillRestaurantHTML();
			callback(null, data);
		});
	}
};

/**
 * Create restaurant HTML and add it to the webpage
 */
let fillRestaurantHTML = (data = restaurant) => {
	const name = document.getElementById('restaurant-name');
	name.innerHTML = data.name;

	const address = document.getElementById('restaurant-address');
	address.innerHTML = data.address;

	let imgName = DBHelper.imageUrlForRestaurant(restaurant).split('.webp')[0];
	const image = document.getElementById('restaurant-img');
	image.className = 'restaurant-img';
	image.src = `${imgName}-medium.webp`;
	image.alt = `${data.name}'s photo.`;

	const cuisine = document.getElementById('restaurant-cuisine');
	cuisine.innerHTML = data.cuisine_type;

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}
	// fill reviews
	DBHelper.fetchReviewsByRestId(restaurant.id).then(reviews =>
		fillReviewsHTML(reviews)
	);
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
let fillRestaurantHoursHTML = (operatingHours = restaurant.operating_hours) => {
	const hours = document.getElementById('restaurant-hours');
	for (let key in operatingHours) {
		if (operatingHours.hasOwnProperty(key)) {
			const row = document.createElement('tr');
			const day = document.createElement('td');
			day.innerHTML = key;
			row.appendChild(day);

			const time = document.createElement('td');
			time.innerHTML = operatingHours[key];
			row.appendChild(time);

			hours.appendChild(row);
		}
	}
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
let fillReviewsHTML = (reviews = restaurant.reviews) => {
	const container = document.getElementById('reviews-container');
	const title = document.createElement('h2');
	title.innerHTML = 'Reviews';
	container.appendChild(title);

	if (!reviews) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet!';
		container.appendChild(noReviews);
		return;
	}
	const ul = document.getElementById('reviews-list');
	reviews.forEach(review => {
		ul.appendChild(createReviewHTML(review));
	});
	container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
let createReviewHTML = review => {
	const li = document.createElement('li');
	const name = document.createElement('p');
	name.innerHTML = review.name;
	name.className = 'reviewer-name';
	li.appendChild(name);

	const date = document.createElement('p');
	date.innerHTML = new Date(review.createdAt).toLocaleString();
	li.appendChild(date);

	const rating = document.createElement('p');
	rating.innerHTML = `Rating: ${review.rating}`;
	li.appendChild(rating);

	const stars = document.createElement('p');
	let starsIcon = '★'.repeat(review.rating);
	stars.innerHTML = `${starsIcon}`;
	stars.className = 'rating-stars';

	li.appendChild(stars);

	const comments = document.createElement('p');
	comments.innerHTML = review.comments;
	li.appendChild(comments);

	return li;
};

// Form validation & submission
let addReview = event => {
	event.preventDefault();
	// Getting the data from the form
	const formData = getFormData();
	DBHelper.addReview(formData);
	addReviewHTML(formData);
	document.getElementById('review-form').reset();
};

let getFormData = () => {
	let restaurant_id = parseInt(getParameterByName('id'));
	let name = document.getElementById('review-author').value;
	let comments = document
		.getElementById('review-comments')
		.value.substring(0, 300);
	let rating = parseInt(
		document.querySelector('#rating_select option:checked').value
	);
	let createdAt = new Date();
	return {
		restaurant_id,
		name,
		createdAt,
		rating,
		comments
	};
};

let addReviewHTML = review => {
	if (document.getElementById('no-review')) {
		document.getElementById('no-review').remove();
	}
	const container = document.getElementById('reviews-container');
	const ul = document.getElementById('reviews-list');

	//insert the new review on top
	ul.insertBefore(createReviewHTML(review), ul.firstChild);
	container.appendChild(ul);
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
let fillBreadcrumb = (data = restaurant) => {
	const breadcrumb = document.getElementById('breadcrumb');
	const li = document.createElement('li');
	li.innerHTML = data.name;
	li.setAttribute('aria-current', 'page');
	breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
let getParameterByName = (name, url) => {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

	const results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

// self executing function here to set a11y title for Google Map's iFrame
(function() {
	setTimeout(() => {
		let restaurantName = document.querySelector('#restaurant-name').innerHTML;
		let googleMapFrame = document.querySelector('#map iframe');
		if (googleMapFrame) {
			googleMapFrame.title = `Google Map Location for Restaurant ${restaurantName} `;
		}
	}, 1000);
})();
