
export default class Restaurant {
	constructor(restaurantAmazonUserSub, name, address, description, points, immediateRewards, redemptionHistory) {
		this.restaurantAmazonUserSub = restaurantAmazonUserSub;
		this.name = name;
		this.address = address;
		this.description = description;
		this.imageUrl = '';
		this.points = points;
		this.immediateRewards = immediateRewards;
		this.redemptionHistory = redemptionHistory;
	}

	setImageUrl(imageUrl) {
		this.imageUrl = imageUrl;
	}
}