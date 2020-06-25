
export default class RecentOrder {
	constructor(timeOfOrder, name, address, totals, partyId, paymentMethod) {
		this.timeOfOrder = timeOfOrder;
		this.name = name;
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