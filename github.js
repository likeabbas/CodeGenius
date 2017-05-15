/**
 * Created by abbas on 5/15/17.
 */

console.log("I'm an extension")

const div = "div"
const a = "a"

var testElement = document.createElement(div)
var testElementText = document.createTextNode("test element")

testElement.appendChild(testElementText)
document.body.appendChild(testElement)
