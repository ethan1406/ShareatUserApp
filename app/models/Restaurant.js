
export default class Restaurant {
	constructor(restaurantId, name, address, description) {
		this.restaurantId = restaurantId;
		this.name = name;
		this.address = address;
		this.description = description;
		this.imageUrl = '';
	}

	setImageUrl(imageUrl) {
		this.imageUrl = imageUrl;
	}
}