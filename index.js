/**
 * Implementation 
 */

// Get the type of whatever is supplied as the argument
function getType(thing) { return Object.prototype.toString.call(thing); }

// Checks if the substring incStr is included in the string str
function hasSubString(str, incStr) { return str.toLowerCase().includes(incStr); }

// Checks if the supplied argument is an array
function isArray(arrCandidate) {
  let typeInfo = getType(arrCandidate);
  return hasSubString(typeInfo, 'array');
}

/* Basket: Configured this way to match the specified interface */
class Basket {
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
  constructor(pricingRules) {
    if (!pricingRules.hasOwnProperty('products') || !isArray(pricingRules.products)) {
      throw new Error('Need an array of products (Format: productCode, name, price) see: wiki');
    }

    if (pricingRules.hasOwnProperty('promotions') && !isArray(pricingRules.promotions)) {
      throw new Error('Promotions need to be an array see: wiki');
    }

    // Set up the state of the basket
    this.products = pricingRules.products;
    this.promotions = pricingRules.promotions;
    this.items = []; // empty basket. Will contain an array or SKU codes as items are added ot the basket
  }

  /**
   * Add an Item
   * @param { String } item - product code representing item to be added. Product must exist in the 'products' member variable
   */
  add(item) { this.items.push(item); }

  /**
   * Get the total value of the items in the basket
   * @return { Number } The total cost of the items in the basket incl promotion deductions
   */
  total() {
    // Add the totals for each of the items in the basket to get the
    // initial price without any discounts applied to it.
    let price = this.items.reduce((totalPrice, currentItem) => {
      // look for item
      let product = this.products.find((prod) => prod.productCode === currentItem);
      if (!product) throw new Error('Unfound product: ', currentItem);

      // get the price
      let price = product.price;

      // add the price to the current total
      let updatedPrice = totalPrice + price;

      // return updated total
      return updatedPrice;
    }, 0);

    // Add sum the savings from each active promotion
    let savings = this.promotions.reduce((totalDiscount, currentPromoFn) => {
      return totalDiscount + currentPromoFn(this.items, this.products);
    }, 0);

    let finalPrice = price - savings;

    return finalPrice;
  }

	/**
   * convenience methods
   */

  /**
   * Convenience method to add multiple items to the basket. Use an array or comma-separted list of item codes 
   * @param { Array.<String> } items - Array of product codes representing the items to add to the basket
   */
  addArray(items) {
    let addedItems;
    if (arguments.length > 1) addedItems = Array.prototype.slice.call(arguments, 0);
    else if (isArray(items)) addedItems = items;
    else throw new Error('Need to add an array of product codes or a comma separated list of product codes');

    // addeditems will be an array by this point. Now we move those items into the items member variable.
    addedItems.forEach(item => this.items.push(item));
  }

  /**
   * Convenience method to remote all the items from the basket
   */
  clearItems() { this.items = []; }
}

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
  let fruitTeaInfo = itemsDb.find(product => product.productCode === 'FR1');
  let discount = 0;

  // If the item is being sold apply the deal: Important in the case of withdrawn items
  if (fruitTeaInfo) {
    // calculate the shoppers earned deals.
    // Filter to get all that they've got and floor to calc per bogof deal
    let fruitTeas = basketItems.filter(item => item === 'FR1');
    let applicableBOGOFs = Math.floor(fruitTeas.length / 2);

    // calculate savings for this deal
    discount = applicableBOGOFs * fruitTeaInfo.price;
  }

  return discount;
}

// Promotion function: Bulk deal price when buying more than 3 strawberries
function bulkBuyStrawberries(basketItems, itemsDb) {
  // make sure the item is still in the products for sale
  let strawberryInfo = itemsDb.find(product => product.productCode === 'SR1');
  let discount = 0;

  // if the item is still available for sale apply the reduction
  if (strawberryInfo) {
    // calculate the shoppers earned deals.
    // Filter to get all that they've got and floor to calc per bogof deal
    let strawberries = basketItems.filter(item => item === 'SR1');

    // calculate savings for this deal
    if (strawberries.length >= 3) discount = 0.5 * strawberries.length;
  }

  return discount;
}

// pricing rules object adding the two promotion functions above
let pricingRules = {
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
const EXPECTED_PRICE1 = 19.34;
const EXPECTED_PRICE2 = 3.11;
const EXPECTED_PRICE3 = 16.61;

let finalPrice = 0;
let basket = new Basket(pricingRules);

// Tests
basket.addArray('FR1', 'SR1', 'FR1', 'CF1');
finalPrice = basket.total();
console.assert(finalPrice === EXPECTED_PRICE1, { error: 'totals incorrect ', price: finalPrice, expected: EXPECTED_PRICE1, basket: basket });

basket.clearItems();
basket.addArray('FR1', 'FR1');
finalPrice = basket.total();
console.assert(finalPrice === EXPECTED_PRICE2, { error: 'totals incorrect ', price: finalPrice, expected: EXPECTED_PRICE2, basket: basket });

basket.clearItems();
basket.addArray('SR1', 'SR1', 'FR1', 'SR1');
finalPrice = basket.total();
console.assert(finalPrice === EXPECTED_PRICE3, { error: 'totals incorrect ', price: finalPrice, expected: EXPECTED_PRICE3, basket: basket });
