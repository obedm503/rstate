import { reducers, procedures } from './index'

describe('handlers', () => {
  describe('reducers', () => {
    it('should handle INCREMENT action', () => {
      expect(reducers.INCREMENT(1, { type: 'INCREMENT' })).toBe(2)
    })

    it('should handle DECREMENT action', () => {
      expect(reducers.DECREMENT(1, { type: 'DECREMENT' })).toBe(0)
    })
  })

  describe('procedures', () => {
    it('should handle INCREMENT_IF_ODD action: 1', () => {
      const dispatch = jest.fn()
      procedures.INCREMENT_IF_ODD(1, { type: 'INCREMENT_IF_ODD' }, dispatch)
      expect(dispatch).toBeCalled()
      expect(dispatch.mock.calls[0][0]).toEqual({ type: 'INCREMENT' })
    })

    it('should handle INCREMENT_IF_ODD action: 2', () => {
      const dispatch = jest.fn()
      procedures.INCREMENT_IF_ODD(2, { type: 'INCREMENT_IF_ODD' }, dispatch)
      expect(dispatch).not.toBeCalled()
    })

    it('should handle INCREMENT_ASYNC action', (done) => {
      const dispatch = jest.fn()
      procedures.INCREMENT_ASYNC(2, { type: 'INCREMENT_ASYNC' }, dispatch)
      setTimeout(() => {
        expect(dispatch).toBeCalled()
        expect(dispatch.mock.calls[0][0]).toEqual({ type: 'INCREMENT' })
        done()
      }, 1000)
    })
  })
})
