function CLASSNAME(name) {
  return {
    attrs: {
      class: name,
    },
  }
}

const InteractiveText = {
  props: ['text', 'prefix', 'onUpdate', 'addClass'],
  data: function () {
    return {
      formValue: {},
    }
  },
  render: function (h) {
    const updateFormValue = (k, v) => {
      if (!this.formValue) this.formValue = {}
      this.formValue[k] = v
      if (this.onUpdate) this.onUpdate(this.formValue)
    }

    function genRichElList(text) {
      const richTextMap = {}

      text.match(/\{[^{}]+\}/g).map((i) => {
        const raw = i.slice(1, -1)
        const parts = raw.split(':')
        const key = parts[0]
        const vlist = (parts[1] || '')
          .slice(1, -1)
          .split(',')
          .filter((i) => i)

        if (vlist && vlist.length) {
          richTextMap[`<${key}>`] = (props = {}) => {
            return h('select', props, [
              h('option', { atrrs: { value: '' } }, '请选择'),
              ...vlist.map((v) => {
                return h(
                  'option',
                  {
                    attrs: {
                      value: v,
                    },
                  },
                  v
                )
              }),
            ])
          }
        } else {
          richTextMap[`<${key}>`] = (props = {}) => {
            return h('input', {
              attrs: {
                type: 'number',
              },
              ...props,
            })
          }
        }
        return null
      })

      const elList = text
        .replace(/\n/g, '####<br>####')
        .replace(/\{([a-zA-Z0-9]+)(\:[^{}]+)?\}/g, '####<$1>####')
        .split('####')
        .filter((i) => i)
        .map((i) => {
          if (i === '<br>') {
            return h('br')
          } else if (i.match(/<[a-zA-Z0-9]+>/)) {
            const key = i.slice(1, -1)
            return richTextMap[i]({
              on: {
                // keyup: (e) => updateFormValue(key, e.target.value),
                // change: (e) => updateFormValue(key, e.target.value),
                input: (e) => updateFormValue(key, e.target.value),
              },
            })
          } else {
            return h('span', i)
          }
        })

      return elList
    }
    return h('div', CLASSNAME(`itext ${this.addClass || ''}`), [
      h('div', CLASSNAME('prefix'), this.prefix),
      h('div', CLASSNAME('content'), genRichElList(this.text)),
    ])
  },
}

const Question = {
  props: ['q', 'onUpdate'],
  data: function () {
    return {
      showAnswer: false,
      answers: {},
      isCorrect: false,
      userAnswers: {},
    }
  },
  render: function (h) {
    let addClass = ''
    if (this.showAnswer) {
      addClass = this.isCorrect ? 'correct' : 'wrong'
    }
    return h('div', CLASSNAME('q'), [
      h('h3', [this.q.t]),
      h(InteractiveText, {
        props: {
          prefix: 'Q',
          text: this.q.q,
          onUpdate: (formValue) => {
            if (this.q.calc) {
              const values = {}
              Object.keys(formValue).forEach((k) => {
                values[k] = Number(formValue[k])
              })
              this.answers = this.q.calc(values)
            }
          },
        },
      }),
      h(InteractiveText, {
        props: {
          addClass,
          prefix: 'A',
          text: this.q.a,
          onUpdate: (formValue) => {
            const values = {}
            Object.keys(formValue).forEach((k) => {
              values[k] = Number(formValue[k])
            })
            this.userAnswers = values

            let correct = true
            Object.keys(this.answers).forEach((k) => {
              if (
                !this.userAnswers[k] ||
                this.answers[k] !== this.userAnswers[k]
              ) {
                correct = false
              }
            })
            this.isCorrect = correct
            if (this.onUpdate) {
              this.onUpdate({
                isCorrect: this.isCorrect,
                answers: this.answers,
                userAnswers: this.userAnswers,
              })
            }
          },
        },
      }),
      this.showAnswer
        ? h(
            'div',
            CLASSNAME('answers'),
            Object.keys(this.answers).map((aKey) => {
              return h('p', `${aKey} = ${this.answers[aKey]}`)
            })
          )
        : null,
      h('div', CLASSNAME('actions'), [
        // h(
        //   'button',
        //   {
        //     attrs: {
        //       class: 'rnd',
        //     },
        //     on: {
        //       click: (e) => {
        //         this.showAnswer = false
        //       },
        //     },
        //   },
        //   ['随机出题']
        // ),
        h(
          'button',
          {
            attrs: {
              class: 'calc',
            },
            on: {
              click: (e) => {
                this.showAnswer = !this.showAnswer
              },
            },
          },
          [!this.showAnswer ? '验证答案' : '隐藏答案']
        ),
      ]),
    ])
  },
}

const app = new Vue({
  el: '#app',
  data: {
    questions: window.questions,
  },
  components: {
    question: Question,
  },
})
