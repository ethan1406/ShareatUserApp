
export default class Restaurant {
	constructor(restaurantAmazonUserSub, name, address, description) {
		this.restaurantAmazonUserSub = restaurantAmazonUserSub;
		this.name = name;
		this.address = address;
		this.description = description;
		this.imageUrl = '';
	}

	setImageUrl(imageUrl) {
		this.imageUrl = imageUrl;
	}
}