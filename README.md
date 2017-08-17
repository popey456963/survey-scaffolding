# survey-scaffolding

A tiny, 5KB library to help with the creation and handling of simple surveys.  Handles routing & results gathering, but expects you to provide styling and the HTML markup.

### example

For the required markup, see example/index.html.

```javascript
function on_finish(results) {
  console.log('results', results)
  $('.results-container').append(`<h1>Thank-you for filling out the survey.</h1>`)
  $('.results-container').append(`<p>${JSON.stringify(results)}</p>`)
}

let Survey = new Surveyor({
  'start': {
    question: 'First query',
    answers: [{
      type: 'radio',
      route: 'continue',
      item: 'Continue'
    }, {
      type: 'radio',
      route: 'end',
      item: 'Finish Survey'
    }]
  },
  'continue': {
    question: 'Second query',
    answers: [{
      type: 'radio',
      route: 'end',
      item: 'Finish Survey'
    }]
  }
}, on_finish)
```

### documentation

Surveyor : Class (questions, finish_callback, options)

questions : Object (question, answers[])  
question : String - 'Contains the prompt for the user'

answers[] : Array of Objects (type, route, item, placeholder)  
type : String - 'Type of input device (e.g. radio, date, text)'  
route : String - 'The next place to take the user'  
item : String - 'Value of the input field (radio)'  
placeholder : String - 'Default value of field (text)'

finish_callback : Function (results)  
results : Object - 'Key value pairs of route name and the value given'

options : Object (various)
