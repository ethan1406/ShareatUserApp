
export default class RecentOrder {
	constructor(timeOfOrder, restaurantName, address, totals, partyId, paymentMethod) {
		this.timeOfOrder = timeOfOrder;
		this.restaurantName = restaurantName;
		this.address = address;
		this.imageUrl = '';
		this.totals = totals;
		this.partyId = partyId;
		this.paymentMethod = paymentMethod;
	}

	setImageUrl(imageUrl) {
		this.imageUrl = imageUrl;
	}
}