/**
 * Implementation 
 */

// Get the type of whatever is supplied as the argument
function getType(thing) { return Object.prototype.toString.call(thing); }

// Checks if the substring incStr is included in the string str
function hasSubString(str, incStr) { return str.toLowerCase().includes(incStr); }

// Checks if the supplied argument is an array
function isArray(arrCandidate) {
	var typeInfo = getType(arrCandidate);
	return hasSubString(typeInfo, 'array');
}

/** Basket: Configured this way to match the specified interface */
function Basket(pricingRules) {
    /**
     * Description of promotion functions
     * eg: function fooPromo(basketItems, itemsDb)
     * @name PromotionFunction
     * @function
     * @param { Array.<String> } basketItems - items in the basket
     * @param { Array.<{ productCode: String, name: String, price: Number}> } itemDb - A copy of the product array
     */


    /**
     * Create a basket by supplying the constuctor with an object. This object should contain the attributes 'products'
     * where products is the key relating to an array of product objects with productCode(string), name(sting), and price(number)
     * attributes.
     * 
     * Optionally a 'promotions' attribute can be added to the pricingRules object. In this case the promotions key relates
     * to an array of promotion functions. These are function that take the basket items and items list as their argument
     * and return a numerical amount representing the discount to be deducted from the total cost.
     * 
     * @param { Array.<{ productCode: String, name: String, price: Number}> } pricingRules.products - Product Array 
     * @param { Array.<PromotionFunction> } pricingRules.promotions - Promotion array.
     */
	if (!pricingRules.hasOwnProperty('products') || !isArray(pricingRules.products)) {
		throw new Error('Need an array of products (Format: productCode, name, price) see: wiki');
	}

	if (pricingRules.hasOwnProperty('promotions') && !isArray(pricingRules.promotions)) {
		throw new Error('Promotions need to be an array see: wiki');
	}

	// Set up the state of the basket
	this.products = pricingRules.products;
	this.promotions = pricingRules.promotions;
	this.items = []; // empty basket
}

/**
 * Add an Item
 * @param { String } item - product code representing item to be added. Product must exist in the 'products' member variable
*/
Basket.prototype.add = function (item) {
	this.items.push(item);
};

/**
 * Get the total value of the items in the basket
 * @return { Number } The total cost of the items in the basket incl promotion deductions
 */
Basket.prototype.total = function () {
	var initialTotal = 0.0;
	var initialSavings = 0.0;
	var that = this;

	var price = this.items.reduce(calcPrice, initialTotal);
	var savings = this.promotions.reduce(addPromotion, initialSavings);
	var finalPrice = price - savings;

	return finalPrice;

	// Internal functions
	function addPromotion(totalDiscount, currentPromoFn) {
		return totalDiscount + currentPromoFn(that.items, that.products);
	}

	function calcPrice(totalPrice, currentItem) {
		// look for item
		var product = that.products.find(function (prod) { return prod.productCode === currentItem });
		if (!product) throw new Error('Unfound product: ', currentItem);

		// get the price
		var price = product.price;

		// add the price to the current total
		var updatedPrice = totalPrice + price;

		// return updated total
		return updatedPrice;
	}
};

/**
 * convenience methods
 */

/**
* Convenience method to add multiple items to the basket. Use an array or comma-separted list of item codes 
* @param { Array.<String> } items - Array of product codes representing the items to add to the basket
*/
Basket.prototype.addArray = function (items) {
	var addedItems;
	var that = this;
	if (arguments.length > 1) addedItems = Array.prototype.slice.call(arguments, 0);
	else if (isArray(items)) addedItems = items;
	else throw new Error('Need to add an array of product codes or a comma separated list of product codes');

	// addeditems will be an array by this point. Now we move those items into the items member variable.
	addedItems.forEach(function (item) { that.items.push(item); });
};

/**
 * Convenience method to remote all the items from the basket
 */
Basket.prototype.clearItems = function () {
	this.items = [];
};

/**
* Test begins!
*/

// promotions can be based on the items in the basket
// In the future we may add the basket price to allow deals
// based on spend like 'spend over £10 and get £2.50 off'
// We add extra's as necessary to avoid used code (YAGNI)

// Promotion function: Buy One Get One Free Fruit Tea
function buyOneGetOneFreeFruitTea(basketItems, itemsDb) {
	// make sure the item is still in the products for sale
	var fruitTeaInfo = itemsDb.find(productFruitTeaPredicate);
	var discount = 0;

	// If the item is being sold apply the deal: Important in the case of withdrawn items
	if (fruitTeaInfo) {
		// calculate the shoppers earned deals.
		// Filter to get all that they've got and floor to calc per bogof deal
		var fruitTeas = basketItems.filter(itemFruitTeaPredicate);
		var applicableBOGOFs = Math.floor(fruitTeas.length / 2);

		// calculate savings for this deal
		var discount = applicableBOGOFs * fruitTeaInfo.price;
	}

	return discount;

	// helper
	function productFruitTeaPredicate(product) { return product.productCode === 'FR1'; }
	function itemFruitTeaPredicate(item) { return item === 'FR1'; }
}

// Promotion function: Bulk deal price when buying more than 3 strawberries
function bulkBuyStrawberries(basketItems, itemsDb) {
	// get the item details
	var strawberryInfo = itemsDb.find(productStrawberryPredicate);
	var discount = 0;

	// if the item is still available for sale apply the reduction
	if (strawberryInfo) {
		// calculate the shoppers earned deals.
		// Filter to get all that they've got and floor to calc per bogof deal
		var strawberries = basketItems.filter(itemFruitTeaPredicate);

		// calculate savings for this deal
		if (strawberries.length >= 3) discount = 0.5 * strawberries.length;
	}

	return discount;

	// internal functions 
	function productStrawberryPredicate(product) { return product.productCode === 'SR1'; }
	function itemFruitTeaPredicate(item) { return item === 'SR1'; }
}

// pricing rules object adding the two promotion functions above
var pricingRules = {
	products: [{
		productCode: 'FR1',
		name: 'Fruit tea',
		price: 3.11,
	}, {
		productCode: 'SR1',
		name: 'Strawberries',
		price: 5.00,
	}, {
		productCode: 'CF1',
		name: 'Coffee',
		price: 11.23,
	}],
	promotions: [
		buyOneGetOneFreeFruitTea,
		bulkBuyStrawberries
	]
};

// Test setup
var EXPECTED_PRICE1 = 19.34;
var EXPECTED_PRICE2 = 3.11;
var EXPECTED_PRICE3 = 16.61;

var finalPrice = 0;
var basket = new Basket(pricingRules);

// Tests
basket.addArray('FR1', 'SR1', 'FR1', 'CF1');
finalPrice = basket.total();
console.assert(finalPrice === EXPECTED_PRICE1, { error: 'totals incorrect ', price: finalPrice, expected: EXPECTED_PRICE1 });

basket.clearItems();
basket.addArray('FR1', 'FR1');
finalPrice = basket.total();
console.assert(finalPrice === EXPECTED_PRICE2, { error: 'totals incorrect ', price: finalPrice, expected: EXPECTED_PRICE2 });

basket.clearItems();
basket.addArray('SR1', 'SR1', 'FR1', 'SR1');
finalPrice = basket.total();
console.assert(finalPrice === EXPECTED_PRICE3, { error: 'totals incorrect ', price: finalPrice, expected: EXPECTED_PRICE3 });