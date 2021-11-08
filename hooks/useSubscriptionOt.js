import React, { useState, useEffect } from 'react'
import { subscribeOT } from 'lib/ot'

const useSubscriptionOT = (route, defaultValue, onPatch) => {
  const [submitChange, setSubmitChange] = useState(null)
  const [data, setData] = useState(defaultValue)

  const fetchData = async () => {
    const {
      patches,
      initialValue: initialValueInner,
      submitChange: submitChangeInner,
    } = await subscribeOT(`http://localhost:3000/api/${route}`)
    setData(initialValueInner)
    setSubmitChange({ submitChange: submitChangeInner })
    for await (const patch of patches) {
      setData(patch.value)
      onPatch?.(patch)
    }
  }

  useEffect(() => {
    fetchData()
  }, [route])

  return {
    data,
    submitChange: submitChange?.submitChange,
  }
}

export default useSubscriptionOT
