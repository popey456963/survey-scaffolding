(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgZGVmYXVsdHMgPSB7XHJcbiAgJ3F1ZXN0aW9uc19zZWxlY3Rvcic6ICcucXVlc3Rpb25zLWNvbnRhaW5lcicsXHJcbiAgJ2l0ZW1fY2xhc3MnOiAnc3VydmV5LWl0ZW0nLFxyXG4gICdxdWVzdGlvbl9jbGFzcyc6ICdxdWVzdGlvbicsXHJcbiAgJ2Fuc3dlcl9jbGFzcyc6ICdhbnN3ZXInXHJcbn1cclxuXHJcbmNsYXNzIFN1cnZleW9yIHtcclxuICBjb25zdHJ1Y3RvcihxdWVzdGlvbnMsIG9wdGlvbnMpIHtcclxuICAgIGlmICh0eXBlb2YgcXVlc3Rpb25zID09ICd1bmRlZmluZWQnKSB0aHJvdyAnUXVlc3Rpb25zIHNob3VsZCBiZSBhbiBvYmplY3QuJ1xyXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09ICd1bmRlZmluZWQnKSBvcHRpb25zICA9IHt9XHJcblxyXG4gICAgdGhpcy5xdWVzdGlvbnMgPSBxdWVzdGlvbnNcclxuICAgIHRoaXMuY3VycmVudF9xdWVzdGlvbiA9ICdzdGFydCdcclxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIG9wdGlvbnMpXHJcbiAgICB0aGlzLm9wdGlvbnMudHlwZXMgPSBPYmplY3QuYXNzaWduKHsgJ3JhZGlvJzogcmFkaW9UeXBlIH0sIG9wdGlvbnMudHlwZXMpXHJcblxyXG4gICAgdGhpcy5xdWVzdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcclxuICAgICAgdGhpcy5hZGRfcXVlc3Rpb24oaW5kZXgsIGl0ZW0pXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxuU3VydmV5b3IucHJvdG90eXBlLmFkZF9xdWVzdGlvbiA9IGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XHJcbiAgLy8gQWRkIHF1ZXN0aW9uIHRvIEhUTUxcclxuICAkKHRoaXMub3B0aW9ucy5xdWVzdGlvbnNfc2VsZWN0b3IpLmFwcGVuZChgXHJcbiAgICA8ZGl2IGNsYXNzPScke3RoaXMub3B0aW9ucy5xdWVzdGlvbl9jbGFzc30gcXVlc3Rpb24tJHtpbmRleH0nPlxyXG4gICAgICA8cD4ke2l0ZW0ucXVlc3Rpb259PC9wPlxyXG4gICAgICA8ZGl2IGNsYXNzPScke3RoaXMub3B0aW9ucy5hbnN3ZXJfY2xhc3N9IGFuc3dlcnMtJHtpbmRleH0nPjwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgYClcclxuXHJcbiAgLy8gQWRkIGFuc3dlcnNcclxuICBpdGVtLmFuc3dlcnMuZm9yRWFjaChmdW5jdGlvbiAoYW5zd2VyX2l0ZW0sIGFuc3dlcl9pbmRleCkge1xyXG4gICAgY29uc29sZS5sb2coYW5zd2VyX2l0ZW0sIGFuc3dlcl9pbmRleClcclxuICAgIHRoaXMuYWRkX2Fuc3dlcihpbmRleCwgYW5zd2VyX2luZGV4LCBhbnN3ZXJfaXRlbSlcclxuICB9KVxyXG59XHJcblxyXG5TdXJ2ZXlvci5wcm90b3R5cGUuYWRkX2Fuc3dlciA9IGZ1bmN0aW9uKHF1ZXN0aW9uX2luZGV4LCBpbmRleCwgaXRlbSkge1xyXG4gIC8vIEFkZCBhbnN3ZXIgdG8gaHRtbFxyXG4gIGlmIChpdGVtLnR5cGUgaW4gdGhpcy5vcHRpb25zLnR5cGUpIHtcclxuICAgICQoYC5hbnN3ZXJzLSR7cXVlc3Rpb25faW5kZXh9YCkuYXBwZW5kKHRoaXMub3B0aW9ucy50eXBlW2l0ZW0udHlwZV0ocXVlc3Rpb25faW5kZXgsIGluZGV4LCBpdGVtKSlcclxuICB9XHJcbn1cclxuXHJcblN1cnZleW9yLnJhZGlvVHlwZSA9IGZ1bmN0aW9uKHF1ZXN0aW9uX2luZGV4LCBpbmRleCwgaXRlbSkge1xyXG4gIHJldHVybiBgXHJcbiAgICA8ZGl2IGNsYXNzPSdzdXJ2ZXktaXRlbSc+XHJcbiAgICAgIDxpbnB1dCBuYW1lPSdyYWRpby0ke3F1ZXN0aW9uX2luZGV4fScgdHlwZT0ncmFkaW8nIGlkPSdyYWRpby0ke3F1ZXN0aW9uX2luZGV4fS0ke2luZGV4fScgZGF0YS1xdWVzdGlvbj0nJHtxdWVzdGlvbl9pbmRleH0nIGRhdGEtYW5zd2VyPScke2luZGV4fScgdmFsdWU9JyR7aXRlbS5pdGVtfScgLz5cclxuICAgICAgPGxhYmVsIGZvcj0ncmFkaW8tJHtxdWVzdGlvbl9pbmRleH0tJHtpbmRleH0nPlxyXG4gICAgICAgIDxzcGFuPjwvc3Bhbj5cclxuICAgICAgICA8cD4ke2l0ZW0uaXRlbX08L3A+XHJcbiAgICAgIDwvbGFiZWw+XHJcbiAgICA8L2Rpdj5cclxuICBgXHJcbn1cclxuXHJcbndpbmRvdy5TdXJ2ZXlvciA9IFN1cnZleW9yXHJcbiJdfQ==
