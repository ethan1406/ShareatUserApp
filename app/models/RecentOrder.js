
export default class RecentOrder {
	constructor(timeOfOrder, name, address) {
		this.timeOfOrder = timeOfOrder;
		this.name = name;
		this.address = address;
		this.imageUrl = '';
	}

	setImageUrl(imageUrl) {
		this.imageUrl = imageUrl;
	}
}