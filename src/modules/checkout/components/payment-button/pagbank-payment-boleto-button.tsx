"use client"
import { Cart } from "@medusajs/medusa"
import { handleBoletoForm, updated_cart } from "@/modules/cart/actions"
import { setPaymentMethod } from "@/modules/checkout/actions"
import { FieldValues, useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@medusajs/ui"
import Spinner from "@/modules/common/icons/spinner"
import Input from "@/modules/common/components/input"
import { toast } from "react-toastify"

const PagBankBoletoPaymentButton = ({
  cart,
  provider_id,
}: {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
  notReady: boolean
  provider_id: string
}) => {
  const [isLoading, setLoading] = useState(false)
  const form = useForm({
    defaultValues: {
      cpf: cart?.billing_address?.metadata?.cpf || "",
    },
  })
  const router = useRouter()

  const onSubmit = async (data: FieldValues) => {
    try {
      setLoading(true)

      await setPaymentMethod(provider_id)

      console.log("inside valid condition and pagbank payment starts")

      const res = await handleBoletoForm(data)
      if (res.error) {
        throw new Error(res.error)
      }
      const updated_Cart = await updated_cart(cart.id)

      if (res) {
        router.push(`/order/boleto/${updated_Cart?.id}`)
      }
      console.log("pagbank payment ends")
    } catch (err: any) {
      console.error("Error during Boleto Payment:", err)
      toast.error(`Error during Boleto Payment:${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Input
        label="CPF / CNPJ"
        {...form.register("cpf", {
          required: true,
        })}
        autoComplete="cpf"
        // placeholder="_ _ _._ _ _._ _ _-_ _"
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <Spinner /> : "Pay with Boleto"}
      </Button>
    </form>
  )
}

export default PagBankBoletoPaymentButton
