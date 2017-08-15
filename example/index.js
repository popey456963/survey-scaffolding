console.log(new Surveyor({
  'start': {
    question: 'What do you want to do?',
    answers: [{
      type: 'radio',
      route: 'next-item',
      item: 'Report a player'
    }, {
      type: 'radio',
      route: 'next-item',
      item: 'Request to be unbanned'
    }]
  },
  'next-item': {
    question: 'Some new item?',
    answers: [{
      type: 'radio',
      route: 'next-item',
      item: 'A'
    }, {
      type: 'radio',
      route: 'next-item',
      item: 'B'
    }]
  }
}))
