function push_results(data) {
  $('.results-container').append(data)
}

function on_finish(results) {
  console.log('results', results)
  push_results(`<h1>Thank-you for filling out the survey.</h1>`)
  push_results(`<p>${JSON.stringify(results)}</p>`)
}

let Survey = new Surveyor({
  'start': {
    question: 'First query?',
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
    question: 'Second query?',
    answers: [{
      type: 'radio',
      route: 'no-choice',
      item: 'No Choice'
    }, {
      type: 'radio',
      route: 'no-choice',
      item: 'No Choice'
    }]
  },
  'no-choice': {
    question: 'Third query?',
    answers: [{
      type: 'radio',
      route: 'end',
      item: 'Finish Survey'
    }, {
      type: 'radio',
      route: 'end',
      item: 'Finish Survey'
    }]
  }
}, on_finish)
