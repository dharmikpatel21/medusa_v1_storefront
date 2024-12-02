"use client"
import { Cart } from "@medusajs/medusa"
import { useRouter } from "next/navigation"
import { setPaymentMethod } from "@/modules/checkout/actions"
import { handlePixPayment } from "@/modules/cart/actions"
import FormSubmitButton from "./submit-button"
import { toast } from "react-toastify"
const PagBankPixPaymentButton = ({
  cart,
  notReady,
  provider_id,
}: {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
  notReady: boolean
  provider_id: string
}) => {
  console.log({ pix: provider_id })
  console.debug({ cart })
  const router = useRouter()

  const handlePagbankPixPayment = async () => {
    try {
      await setPaymentMethod(provider_id)
      const updated_Cart = await handlePixPayment()

      router.push(`/order/pix/${updated_Cart?.id}`)
    } catch (error: any) {
      console.error("Error during Pagbank Pix payment:", error)
      toast.error("Error during Pagbank Pix payment.")
    }
  }

  return (
    <form action={handlePagbankPixPayment} className="flex flex-col gap-4">
      <FormSubmitButton> Pay with Pagbank Pix</FormSubmitButton>
    </form>
  )
}

export default PagBankPixPaymentButton
