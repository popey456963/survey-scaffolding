let defaults = {
  'questions_selector': '.questions-container',
  'item_class': 'survey-item',
  'question_class': 'question',
  'answer_class': 'answer'
}

class Surveyor {
  constructor(questions, options) {
    if (typeof questions == 'undefined') throw 'Questions should be an object.'
    if (typeof options == 'undefined') options  = {}

    this.questions = questions
    this.current_question = 'start'
    this.options = Object.assign(defaults, options)
    this.options.types = Object.assign({ 'radio': radioType }, options.types)

    this.questions.forEach(function (item, index) {
      this.add_question(index, item)
    })
  }
}

Surveyor.prototype.add_question = function(index, item) {
  // Add question to HTML
  $(this.options.questions_selector).append(`
    <div class='${this.options.question_class} question-${index}'>
      <p>${item.question}</p>
      <div class='${this.options.answer_class} answers-${index}'></div>
    </div>
  `)

  // Add answers
  item.answers.forEach(function (answer_item, answer_index) {
    console.log(answer_item, answer_index)
    this.add_answer(index, answer_index, answer_item)
  })
}

Surveyor.prototype.add_answer = function(question_index, index, item) {
  // Add answer to html
  if (item.type in this.options.type) {
    $(`.answers-${question_index}`).append(this.options.type[item.type](question_index, index, item))
  }
}

Surveyor.radioType = function(question_index, index, item) {
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
