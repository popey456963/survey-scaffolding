let defaults = {
  'questions_container_selector': '.questions-container',
  'results_container_selector': '.results-container',
  'results_selector': '.results',
  'questions_selector': '.questions',
  'question_selector': '.question',
  'item_class': 'survey-item',
  'question_class': 'question',
  'answer_class': 'answer'
}

class Surveyor {
  constructor(questions, finish, options) {
    this.that = this

    if (typeof questions == 'undefined') throw 'Questions should be an object.'
    if (typeof options == 'undefined') options  = {}
    if (typeof finish == 'undefined') finish = () => {}
    if (typeof finish == 'object') {
      options = finish
      finish = () => {} // noop
    }

    this.questions = questions
    this.current_question = 'start'
    this.previous = []
    this.finish = finish
    this.options = Object.assign(defaults, options)
    this.types = { 'radio': this.radioType }

    // Add each question to the document
    for (var [index, item] of Object.entries(this.questions)) {
      this.add_question(index, item)
    }

    // Fix for spotty appearance
    $(this.options.results_selector).hide()
    $(this.options.results_selector).removeClass('hidden')

    // On radio button click, msove to next screen
    $(`input[type='radio']`).click((item) => {
      let question = item.target.dataset.question
      let answer = item.target.dataset.answer
      console.log('Jumping from radio to', this.questions[question].answers[answer].route)
      this.that.jump_question(this.questions[question].answers[answer].route)
    })

    $('.prev').click(() => {
      this.that.jump_question(this.previous.pop(), true)
    })

    $('.back').click(() => {
      this.that.jump_question(this.previous.pop(), true)
    })

    $('.next').click(this.that.next)
    $(`input[type='text']`).keyup((e) => { if (e.keyCode == 13) { this.that.next() } })

    // Activate date time pickers
    $('.datetimepicker').datetimepicker()

    // Activate the first one
    $(`.question-${this.current_question}`).addClass('active')
    this.enable_buttons()
  }
}

Surveyor.prototype.add_question = function(index, item) {
  // Add question to HTML
  console.log('Adding question', index, item)
  $(this.options.questions_container_selector).append(`
    <div class='${this.options.question_class} question-${index}'>
      <p>${item.question}</p>
      <div class='${this.options.answer_class} answers-${index}'></div>
    </div>
  `)

  // Add answers
  item.answers.forEach(function (answer_item, answer_index) {
    console.log('Looping answer', answer_item, answer_index)
    this.add_answer(index, answer_index, answer_item)
  }.bind(this))
}

Surveyor.prototype.add_answer = function(question_index, index, item) {
  console.log('Adding answer', question_index, index, item)
  // Add answer to html
  if (item.type in this.types) {
    $(`.answers-${question_index}`).append(this.types[item.type](question_index, index, item))
  }
}

Surveyor.prototype.jump_question = function(question, ignoreHistory) {
  question = question || 'start'
  console.log('Switching question', this.current_question, question)
  if (question == 'end') {
    // We have finished the questionaire.
    console.log('Questionaire finished')
    $(this.options.results_container_selector).html('')
    this.finish(this.retrieve_data())
    $(this.options.results_selector).slideDown()
    $(this.options.questions_selector).slideUp()
  } else if (this.current_question == 'end') {
    console.log('Changing values')
    $(this.options.results_selector).slideUp()
    $(this.options.questions_selector).slideDown()
  } else {
    $(this.options.question_selector).removeClass('active')
    $(`.question-${question}`).addClass('active')
  }

  if (!ignoreHistory) this.previous.push(this.current_question)
  this.current_question = question
  console.log(`Changed current page to ${this.current_question}`)
  if (question != 'end') this.enable_buttons()
}

Surveyor.prototype.next = function() {
  let checked_box = $(`input[name='radio-${this.current_question}']:checked`)
  if (this.questions[this.current_question].answers.some((e) => e.type != 'radio')) {
    console.log('Jumping from input to', this.questions[this.current_question].answers[0].route)
    this.jump_question(this.questions[this.current_question].answers[0].route)
  } else if (checked_box.val()) {
    console.log('Jumping from radio next to', this.questions[checked_box.data('question')].answers[checked_box.data('answer')].route)
    this.jump_question(this.questions[checked_box.data('question')].answers[checked_box.data('answer')].route)
  }
}

Surveyor.prototype.enable_buttons = function(question, ignoreHistory) {
  console.log('Enable buttons for', this.current_question)
  this.previous.length ? $('.prev').removeClass('hidden') : $('.prev').addClass('hidden')
  if (this.questions[this.current_question].answers.some((e) => e.type != 'radio') || $(`input[name='radio-${this.current_question}']:checked`).val()) {
    $('.next').removeClass('hidden')
  } else {
    $('.next').addClass('hidden')
  }
}

Surveyor.prototype.retrieve_data = function() {
  let data = {}
  for (let question in this.questions) {
    let question_type = this.questions[question].answers[0].type
    if (question_type == 'radio') {
      data[question] = $(`input[name='radio-${question}']:checked`).val()
    } else if (['text', 'date'].includes(question_type)) {
      data[question] = $(`input[data-question='${question}']`).val()
    }
  }
  return data
}

Surveyor.prototype.radioType = function(question_index, index, item) {
  return `
    <div class='survey-item'>
      <input name='radio-${question_index}' type='radio' id='radio-${question_index}-${index}' data-question='${question_index}' data-answer='${index}' value='${item.item}' />
      <label for='radio-${question_index}-${index}'>
        <span></span>
        <p>${item.item}</p>
      </label>
    </div>
  `
}

window.Surveyor = Surveyor
