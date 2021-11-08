import React, { useState, useEffect } from 'react'
import { subscribeOT } from 'lib/ot'

const useSubscriptionOT = (route, defaultValue) => {
  const [submitChange, setSubmitChange] = useState(null)
  const [data, setData] = useState(defaultValue)
  const [initialValue, setInitialValue] = useState(defaultValue)

  const fetchData = async () => {
    const {
      patches,
      initialValue: initialValueInner,
      submitChange: submitChangeInner,
    } = await subscribeOT(`http://localhost:3000/api/${route}`)
    setData(initialValue)
    setInitialValue(initialValueInner)
    setSubmitChange({ submitChange: submitChangeInner })
    for await (const innerData of patches) {
      setData(innerData.value)
      console.log('_INNER_DATA_', innerData)
    }
  }

  useEffect(() => {
    fetchData()
  }, [route])

  return {
    data,
    initialValue,
    submitChange: submitChange?.submitChange,
  }
}

export default useSubscriptionOT
