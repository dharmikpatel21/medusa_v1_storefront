"use client"

import Spinner from "@/modules/common/icons/spinner"
import { Button } from "@medusajs/ui"
import { useFormStatus } from "react-dom"

const FormSubmitButton = ({
  children,
  ...props
}: {
  children: React.ReactNode
}) => {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? <Spinner /> : children}
    </Button>
  )
}

export default FormSubmitButton
