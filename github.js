/**
 * Created by abbas on 5/15/17.
 */
document.onload = function () {

  const div    = "div"
  const script = "script"

  const commentClassName = "pl-c"

  /* Test - Extension running on *github.com */
  console.log("I'm an extension running only on *github.com")
  /* -------- */


  /* Test - Appending element to DOM */
  var testElement     = document.createElement(div)
  var testElementText = document.createTextNode("test element")

  testElement.appendChild(testElementText)
  document.body.appendChild(testElement)
  /* -------- */


  /* Test - Console.log all comment elements on page */
  var commentElements = document.getElementsByClassName(commentClassName)
  console.log(commentElements)
  /* -------- */


  /* Test- Remove all comment elements on page */
  var i
  var currentNode
  var parentNode
  var grandparentNode
  var greatGrandparentNode

  for (i = 0; i < commentElements.length; i++) {

    currentNode = commentElements[i]
    while (currentNode.firstChild) {
      currentNode.removeChild(currentNode.firstChild)
    }

    parentNode           = currentNode.parentNode
    grandparentNode      = parentNode.parentNode
    greatGrandparentNode = grandparentNode.parentNode

    greatGrandparentNode.removeChild(grandparentNode)
  }

  /* TODO - currently has to run twice */
  commentElements = document.getElementsByClassName(commentClassName)
  for (i = 0; i < commentElements.length; i++) {

    currentNode = commentElements[i]
    while (currentNode.firstChild) {
      currentNode.removeChild(currentNode.firstChild)
    }

    parentNode           = currentNode.parentNode
    grandparentNode      = parentNode.parentNode
    greatGrandparentNode = grandparentNode.parentNode

    greatGrandparentNode.removeChild(grandparentNode)
  }
  /* -------- */

}()




