import React from 'react'
import { shallow } from 'enzyme'
import Counter from './Counter'

function setup(value = 0) {
  const actions = {
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
    onIncrementIfOdd: jest.fn(),
    onIncrementAsync: jest.fn(),
  }
  const component = shallow(
    <Counter value={value} {...actions} />
  )

  return {
    component: component,
    actions: actions,
    buttons: component.find('button'),
    p: component.find('p')
  }
}

describe('Counter component', () => {
  it('should display count', () => {
    const { p } = setup()
    expect(p.text()).toMatch(/^Clicked: 0 times/)
  })

  it('first button should call onIncrement', () => {
    const { buttons, actions } = setup()
    buttons.at(0).simulate('click')
    expect(actions.onIncrement).toBeCalled()
  })

  it('second button should call onDecrement', () => {
    const { buttons, actions } = setup()
    buttons.at(1).simulate('click')
    expect(actions.onDecrement).toBeCalled()
  })

  it('third button should call onIncrementIfOdd', () => {
    const { buttons, actions } = setup()
    buttons.at(2).simulate('click')
    expect(actions.onIncrementIfOdd).toBeCalled()
  })

  it('fourth button should call onIncrementAsync', () => {
    const { buttons, actions } = setup()
    buttons.at(3).simulate('click')
    expect(actions.onIncrementAsync).toBeCalled()
  })
})
