
export default class Card {
	constructor(cardId, last4Digits, type, selected) {
		this.cardId = cardId;
		this.last4Digits = last4Digits;
		this.type = type;
		this.selected = selected;
	}
}