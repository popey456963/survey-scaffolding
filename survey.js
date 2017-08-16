(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgZGVmYXVsdHMgPSB7XHJcbiAgJ3F1ZXN0aW9uc19jb250YWluZXJfc2VsZWN0b3InOiAnLnF1ZXN0aW9ucy1jb250YWluZXInLFxyXG4gICdyZXN1bHRzX2NvbnRhaW5lcl9zZWxlY3Rvcic6ICcucmVzdWx0cy1jb250YWluZXInLFxyXG4gICdyZXN1bHRzX3NlbGVjdG9yJzogJy5yZXN1bHRzJyxcclxuICAncXVlc3Rpb25zX3NlbGVjdG9yJzogJy5xdWVzdGlvbnMnLFxyXG4gICdxdWVzdGlvbl9zZWxlY3Rvcic6ICcucXVlc3Rpb24nLFxyXG4gICdpdGVtX2NsYXNzJzogJ3N1cnZleS1pdGVtJyxcclxuICAncXVlc3Rpb25fY2xhc3MnOiAncXVlc3Rpb24nLFxyXG4gICdhbnN3ZXJfY2xhc3MnOiAnYW5zd2VyJ1xyXG59XHJcblxyXG5jbGFzcyBTdXJ2ZXlvciB7XHJcbiAgY29uc3RydWN0b3IocXVlc3Rpb25zLCBmaW5pc2gsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMudGhhdCA9IHRoaXNcclxuXHJcbiAgICBpZiAodHlwZW9mIHF1ZXN0aW9ucyA9PSAndW5kZWZpbmVkJykgdGhyb3cgJ1F1ZXN0aW9ucyBzaG91bGQgYmUgYW4gb2JqZWN0LidcclxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAndW5kZWZpbmVkJykgb3B0aW9ucyAgPSB7fVxyXG4gICAgaWYgKHR5cGVvZiBmaW5pc2ggPT0gJ3VuZGVmaW5lZCcpIGZpbmlzaCA9ICgpID0+IHt9XHJcbiAgICBpZiAodHlwZW9mIGZpbmlzaCA9PSAnb2JqZWN0Jykge1xyXG4gICAgICBvcHRpb25zID0gZmluaXNoXHJcbiAgICAgIGZpbmlzaCA9ICgpID0+IHt9IC8vIG5vb3BcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnF1ZXN0aW9ucyA9IHF1ZXN0aW9uc1xyXG4gICAgdGhpcy5jdXJyZW50X3F1ZXN0aW9uID0gJ3N0YXJ0J1xyXG4gICAgdGhpcy5wcmV2aW91cyA9IFtdXHJcbiAgICB0aGlzLmZpbmlzaCA9IGZpbmlzaFxyXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgb3B0aW9ucylcclxuICAgIHRoaXMudHlwZXMgPSB7ICdyYWRpbyc6IHRoaXMucmFkaW9UeXBlIH1cclxuXHJcbiAgICAvLyBBZGQgZWFjaCBxdWVzdGlvbiB0byB0aGUgZG9jdW1lbnRcclxuICAgIGZvciAodmFyIFtpbmRleCwgaXRlbV0gb2YgT2JqZWN0LmVudHJpZXModGhpcy5xdWVzdGlvbnMpKSB7XHJcbiAgICAgIHRoaXMuYWRkX3F1ZXN0aW9uKGluZGV4LCBpdGVtKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEZpeCBmb3Igc3BvdHR5IGFwcGVhcmFuY2VcclxuICAgICQodGhpcy5vcHRpb25zLnJlc3VsdHNfc2VsZWN0b3IpLmhpZGUoKVxyXG4gICAgJCh0aGlzLm9wdGlvbnMucmVzdWx0c19zZWxlY3RvcikucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXHJcblxyXG4gICAgLy8gT24gcmFkaW8gYnV0dG9uIGNsaWNrLCBtc292ZSB0byBuZXh0IHNjcmVlblxyXG4gICAgJChgaW5wdXRbdHlwZT0ncmFkaW8nXWApLmNsaWNrKChpdGVtKSA9PiB7XHJcbiAgICAgIGxldCBxdWVzdGlvbiA9IGl0ZW0udGFyZ2V0LmRhdGFzZXQucXVlc3Rpb25cclxuICAgICAgbGV0IGFuc3dlciA9IGl0ZW0udGFyZ2V0LmRhdGFzZXQuYW5zd2VyXHJcbiAgICAgIGNvbnNvbGUubG9nKCdKdW1waW5nIGZyb20gcmFkaW8gdG8nLCB0aGlzLnF1ZXN0aW9uc1txdWVzdGlvbl0uYW5zd2Vyc1thbnN3ZXJdLnJvdXRlKVxyXG4gICAgICB0aGlzLnRoYXQuanVtcF9xdWVzdGlvbih0aGlzLnF1ZXN0aW9uc1txdWVzdGlvbl0uYW5zd2Vyc1thbnN3ZXJdLnJvdXRlKVxyXG4gICAgfSlcclxuXHJcbiAgICAkKCcucHJldicpLmNsaWNrKCgpID0+IHtcclxuICAgICAgdGhpcy50aGF0Lmp1bXBfcXVlc3Rpb24odGhpcy5wcmV2aW91cy5wb3AoKSwgdHJ1ZSlcclxuICAgIH0pXHJcblxyXG4gICAgJCgnLmJhY2snKS5jbGljaygoKSA9PiB7XHJcbiAgICAgIHRoaXMudGhhdC5qdW1wX3F1ZXN0aW9uKHRoaXMucHJldmlvdXMucG9wKCksIHRydWUpXHJcbiAgICB9KVxyXG5cclxuICAgICQoJy5uZXh0JykuY2xpY2sodGhpcy50aGF0Lm5leHQpXHJcbiAgICAkKGBpbnB1dFt0eXBlPSd0ZXh0J11gKS5rZXl1cCgoZSkgPT4geyBpZiAoZS5rZXlDb2RlID09IDEzKSB7IHRoaXMudGhhdC5uZXh0KCkgfSB9KVxyXG5cclxuICAgIC8vIEFjdGl2YXRlIGRhdGUgdGltZSBwaWNrZXJzXHJcbiAgICAkKCcuZGF0ZXRpbWVwaWNrZXInKS5kYXRldGltZXBpY2tlcigpXHJcblxyXG4gICAgLy8gQWN0aXZhdGUgdGhlIGZpcnN0IG9uZVxyXG4gICAgJChgLnF1ZXN0aW9uLSR7dGhpcy5jdXJyZW50X3F1ZXN0aW9ufWApLmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgdGhpcy5lbmFibGVfYnV0dG9ucygpXHJcbiAgfVxyXG59XHJcblxyXG5TdXJ2ZXlvci5wcm90b3R5cGUuYWRkX3F1ZXN0aW9uID0gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcclxuICAvLyBBZGQgcXVlc3Rpb24gdG8gSFRNTFxyXG4gIGNvbnNvbGUubG9nKCdBZGRpbmcgcXVlc3Rpb24nLCBpbmRleCwgaXRlbSlcclxuICAkKHRoaXMub3B0aW9ucy5xdWVzdGlvbnNfY29udGFpbmVyX3NlbGVjdG9yKS5hcHBlbmQoYFxyXG4gICAgPGRpdiBjbGFzcz0nJHt0aGlzLm9wdGlvbnMucXVlc3Rpb25fY2xhc3N9IHF1ZXN0aW9uLSR7aW5kZXh9Jz5cclxuICAgICAgPHA+JHtpdGVtLnF1ZXN0aW9ufTwvcD5cclxuICAgICAgPGRpdiBjbGFzcz0nJHt0aGlzLm9wdGlvbnMuYW5zd2VyX2NsYXNzfSBhbnN3ZXJzLSR7aW5kZXh9Jz48L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gIGApXHJcblxyXG4gIC8vIEFkZCBhbnN3ZXJzXHJcbiAgaXRlbS5hbnN3ZXJzLmZvckVhY2goZnVuY3Rpb24gKGFuc3dlcl9pdGVtLCBhbnN3ZXJfaW5kZXgpIHtcclxuICAgIGNvbnNvbGUubG9nKCdMb29waW5nIGFuc3dlcicsIGFuc3dlcl9pdGVtLCBhbnN3ZXJfaW5kZXgpXHJcbiAgICB0aGlzLmFkZF9hbnN3ZXIoaW5kZXgsIGFuc3dlcl9pbmRleCwgYW5zd2VyX2l0ZW0pXHJcbiAgfS5iaW5kKHRoaXMpKVxyXG59XHJcblxyXG5TdXJ2ZXlvci5wcm90b3R5cGUuYWRkX2Fuc3dlciA9IGZ1bmN0aW9uKHF1ZXN0aW9uX2luZGV4LCBpbmRleCwgaXRlbSkge1xyXG4gIGNvbnNvbGUubG9nKCdBZGRpbmcgYW5zd2VyJywgcXVlc3Rpb25faW5kZXgsIGluZGV4LCBpdGVtKVxyXG4gIC8vIEFkZCBhbnN3ZXIgdG8gaHRtbFxyXG4gIGlmIChpdGVtLnR5cGUgaW4gdGhpcy50eXBlcykge1xyXG4gICAgJChgLmFuc3dlcnMtJHtxdWVzdGlvbl9pbmRleH1gKS5hcHBlbmQodGhpcy50eXBlc1tpdGVtLnR5cGVdKHF1ZXN0aW9uX2luZGV4LCBpbmRleCwgaXRlbSkpXHJcbiAgfVxyXG59XHJcblxyXG5TdXJ2ZXlvci5wcm90b3R5cGUuanVtcF9xdWVzdGlvbiA9IGZ1bmN0aW9uKHF1ZXN0aW9uLCBpZ25vcmVIaXN0b3J5KSB7XHJcbiAgcXVlc3Rpb24gPSBxdWVzdGlvbiB8fCAnc3RhcnQnXHJcbiAgY29uc29sZS5sb2coJ1N3aXRjaGluZyBxdWVzdGlvbicsIHRoaXMuY3VycmVudF9xdWVzdGlvbiwgcXVlc3Rpb24pXHJcbiAgaWYgKHF1ZXN0aW9uID09ICdlbmQnKSB7XHJcbiAgICAvLyBXZSBoYXZlIGZpbmlzaGVkIHRoZSBxdWVzdGlvbmFpcmUuXHJcbiAgICBjb25zb2xlLmxvZygnUXVlc3Rpb25haXJlIGZpbmlzaGVkJylcclxuICAgICQodGhpcy5vcHRpb25zLnJlc3VsdHNfY29udGFpbmVyX3NlbGVjdG9yKS5odG1sKCcnKVxyXG4gICAgdGhpcy5maW5pc2godGhpcy5yZXRyaWV2ZV9kYXRhKCkpXHJcbiAgICAkKHRoaXMub3B0aW9ucy5yZXN1bHRzX3NlbGVjdG9yKS5zbGlkZURvd24oKVxyXG4gICAgJCh0aGlzLm9wdGlvbnMucXVlc3Rpb25zX3NlbGVjdG9yKS5zbGlkZVVwKClcclxuICB9IGVsc2UgaWYgKHRoaXMuY3VycmVudF9xdWVzdGlvbiA9PSAnZW5kJykge1xyXG4gICAgY29uc29sZS5sb2coJ0NoYW5naW5nIHZhbHVlcycpXHJcbiAgICAkKHRoaXMub3B0aW9ucy5yZXN1bHRzX3NlbGVjdG9yKS5zbGlkZVVwKClcclxuICAgICQodGhpcy5vcHRpb25zLnF1ZXN0aW9uc19zZWxlY3Rvcikuc2xpZGVEb3duKClcclxuICB9IGVsc2Uge1xyXG4gICAgJCh0aGlzLm9wdGlvbnMucXVlc3Rpb25fc2VsZWN0b3IpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgJChgLnF1ZXN0aW9uLSR7cXVlc3Rpb259YCkuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgfVxyXG5cclxuICBpZiAoIWlnbm9yZUhpc3RvcnkpIHRoaXMucHJldmlvdXMucHVzaCh0aGlzLmN1cnJlbnRfcXVlc3Rpb24pXHJcbiAgdGhpcy5jdXJyZW50X3F1ZXN0aW9uID0gcXVlc3Rpb25cclxuICBjb25zb2xlLmxvZyhgQ2hhbmdlZCBjdXJyZW50IHBhZ2UgdG8gJHt0aGlzLmN1cnJlbnRfcXVlc3Rpb259YClcclxuICBpZiAocXVlc3Rpb24gIT0gJ2VuZCcpIHRoaXMuZW5hYmxlX2J1dHRvbnMoKVxyXG59XHJcblxyXG5TdXJ2ZXlvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gIGxldCBjaGVja2VkX2JveCA9ICQoYGlucHV0W25hbWU9J3JhZGlvLSR7dGhpcy5jdXJyZW50X3F1ZXN0aW9ufSddOmNoZWNrZWRgKVxyXG4gIGlmICh0aGlzLnF1ZXN0aW9uc1t0aGlzLmN1cnJlbnRfcXVlc3Rpb25dLmFuc3dlcnMuc29tZSgoZSkgPT4gZS50eXBlICE9ICdyYWRpbycpKSB7XHJcbiAgICBjb25zb2xlLmxvZygnSnVtcGluZyBmcm9tIGlucHV0IHRvJywgdGhpcy5xdWVzdGlvbnNbdGhpcy5jdXJyZW50X3F1ZXN0aW9uXS5hbnN3ZXJzWzBdLnJvdXRlKVxyXG4gICAgdGhpcy5qdW1wX3F1ZXN0aW9uKHRoaXMucXVlc3Rpb25zW3RoaXMuY3VycmVudF9xdWVzdGlvbl0uYW5zd2Vyc1swXS5yb3V0ZSlcclxuICB9IGVsc2UgaWYgKGNoZWNrZWRfYm94LnZhbCgpKSB7XHJcbiAgICBjb25zb2xlLmxvZygnSnVtcGluZyBmcm9tIHJhZGlvIG5leHQgdG8nLCB0aGlzLnF1ZXN0aW9uc1tjaGVja2VkX2JveC5kYXRhKCdxdWVzdGlvbicpXS5hbnN3ZXJzW2NoZWNrZWRfYm94LmRhdGEoJ2Fuc3dlcicpXS5yb3V0ZSlcclxuICAgIHRoaXMuanVtcF9xdWVzdGlvbih0aGlzLnF1ZXN0aW9uc1tjaGVja2VkX2JveC5kYXRhKCdxdWVzdGlvbicpXS5hbnN3ZXJzW2NoZWNrZWRfYm94LmRhdGEoJ2Fuc3dlcicpXS5yb3V0ZSlcclxuICB9XHJcbn1cclxuXHJcblN1cnZleW9yLnByb3RvdHlwZS5lbmFibGVfYnV0dG9ucyA9IGZ1bmN0aW9uKHF1ZXN0aW9uLCBpZ25vcmVIaXN0b3J5KSB7XHJcbiAgY29uc29sZS5sb2coJ0VuYWJsZSBidXR0b25zIGZvcicsIHRoaXMuY3VycmVudF9xdWVzdGlvbilcclxuICB0aGlzLnByZXZpb3VzLmxlbmd0aCA/ICQoJy5wcmV2JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpIDogJCgnLnByZXYnKS5hZGRDbGFzcygnaGlkZGVuJylcclxuICBpZiAodGhpcy5xdWVzdGlvbnNbdGhpcy5jdXJyZW50X3F1ZXN0aW9uXS5hbnN3ZXJzLnNvbWUoKGUpID0+IGUudHlwZSAhPSAncmFkaW8nKSB8fCAkKGBpbnB1dFtuYW1lPSdyYWRpby0ke3RoaXMuY3VycmVudF9xdWVzdGlvbn0nXTpjaGVja2VkYCkudmFsKCkpIHtcclxuICAgICQoJy5uZXh0JykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXHJcbiAgfSBlbHNlIHtcclxuICAgICQoJy5uZXh0JykuYWRkQ2xhc3MoJ2hpZGRlbicpXHJcbiAgfVxyXG59XHJcblxyXG5TdXJ2ZXlvci5wcm90b3R5cGUucmV0cmlldmVfZGF0YSA9IGZ1bmN0aW9uKCkge1xyXG4gIGxldCBkYXRhID0ge31cclxuICBmb3IgKGxldCBxdWVzdGlvbiBpbiB0aGlzLnF1ZXN0aW9ucykge1xyXG4gICAgbGV0IHF1ZXN0aW9uX3R5cGUgPSB0aGlzLnF1ZXN0aW9uc1txdWVzdGlvbl0uYW5zd2Vyc1swXS50eXBlXHJcbiAgICBpZiAocXVlc3Rpb25fdHlwZSA9PSAncmFkaW8nKSB7XHJcbiAgICAgIGRhdGFbcXVlc3Rpb25dID0gJChgaW5wdXRbbmFtZT0ncmFkaW8tJHtxdWVzdGlvbn0nXTpjaGVja2VkYCkudmFsKClcclxuICAgIH0gZWxzZSBpZiAoWyd0ZXh0JywgJ2RhdGUnXS5pbmNsdWRlcyhxdWVzdGlvbl90eXBlKSkge1xyXG4gICAgICBkYXRhW3F1ZXN0aW9uXSA9ICQoYGlucHV0W2RhdGEtcXVlc3Rpb249JyR7cXVlc3Rpb259J11gKS52YWwoKVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZGF0YVxyXG59XHJcblxyXG5TdXJ2ZXlvci5wcm90b3R5cGUucmFkaW9UeXBlID0gZnVuY3Rpb24ocXVlc3Rpb25faW5kZXgsIGluZGV4LCBpdGVtKSB7XHJcbiAgcmV0dXJuIGBcclxuICAgIDxkaXYgY2xhc3M9J3N1cnZleS1pdGVtJz5cclxuICAgICAgPGlucHV0IG5hbWU9J3JhZGlvLSR7cXVlc3Rpb25faW5kZXh9JyB0eXBlPSdyYWRpbycgaWQ9J3JhZGlvLSR7cXVlc3Rpb25faW5kZXh9LSR7aW5kZXh9JyBkYXRhLXF1ZXN0aW9uPScke3F1ZXN0aW9uX2luZGV4fScgZGF0YS1hbnN3ZXI9JyR7aW5kZXh9JyB2YWx1ZT0nJHtpdGVtLml0ZW19JyAvPlxyXG4gICAgICA8bGFiZWwgZm9yPSdyYWRpby0ke3F1ZXN0aW9uX2luZGV4fS0ke2luZGV4fSc+XHJcbiAgICAgICAgPHNwYW4+PC9zcGFuPlxyXG4gICAgICAgIDxwPiR7aXRlbS5pdGVtfTwvcD5cclxuICAgICAgPC9sYWJlbD5cclxuICAgIDwvZGl2PlxyXG4gIGBcclxufVxyXG5cclxud2luZG93LlN1cnZleW9yID0gU3VydmV5b3JcclxuIl19
