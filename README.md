# ubuntu-shopping-basket

I've submitted two versions of the test one targetting ES5 (`index-es5.js`) and the other ES6(`index.js`) my main submission.

I've designed the classes to take the priceRules object as per the interface:
```
var basket = new Basket(pricingRules)
basket.add(item)
basket.add(item)
var price = basket.total()
```

Both tests feature tests via `console.assert` to test the values in the Test Data section. All the tests for both versions pass with the values set as per that section.

I've designed the code to be readable. Optimisations however are possible that would allow the promotions to be calculated alongside the price in a single pass. I've not gone for this approach as I feel that this will clutter the code and is more likely to lead to errors in the future.

Currently the total cost is calculated as an initial pass, whilst still calculating the total I start looping through and applying the promotions. I created the promotions as functions and apply them in this fashion specifically to avoid the kinds of issues that I would hear of whilst working at Sainsbury's where buy one get one free promotions would affect overlapping discounts creating further deductions off the basket.

By totalling each promotions effect in isolation I am able to prevent potential issues and make the code easier to debug. The additional benefit of organising the promotions like this is that in the future it would be easy to extend the functionality of the promotions. For instance, if we addde a matrix of promotions we could specify which combinations of offers would work together and prevent other from working in the same transaction.

We could extend the arguments to allow the promotions to be based on other criteria like the total cost of the basket, or even the Date.

The product list currently resides in the basket, however in the future this would likely become its own class. Because of the functional approach used here, it would be easy to split this out into its own class.


To run this file, enter the command line (bash/git-bash) and run `node index.js` or `node index-es5.js` alternatively you could paste the code into developer tools console.
