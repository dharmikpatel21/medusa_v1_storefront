"use client"
import React from "react"
import { useBarcode } from "@createnextapp/react-barcode"

const Barcode = ({ value }: { value: string }) => {
  const { inputRef } = useBarcode({
    value,
    options: {},
  })

  return <svg ref={inputRef} className="w-full h-full" />
}

export default Barcode
