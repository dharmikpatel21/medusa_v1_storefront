"use client"
import { Cart } from "@medusajs/medusa"
import { placeOrder, setPaymentMethod } from "@/modules/checkout/actions"
import { handlePagbankForm } from "@/modules/cart/actions"
import CreditCard from "public/icons/credit-card.svg"
import Script from "next/script"
import { useState } from "react"
import { Button } from "@medusajs/ui"
import Spinner from "@/modules/common/icons/spinner"
import Input from "@/modules/common/components/input"
import { InputMask } from "@react-input/mask"
import { toast } from "react-toastify"
export type SelectOptions = "1x" | "2x" | "3x"

type SelectOptionsProps = {
  selectby: SelectOptions
  setQueryParams: (name: string, value: SelectOptions) => void
}

const PagBankPaymentCardButton = (
  {
    cart,
    notReady,
    provider_id,
  }: {
    cart: Omit<Cart, "refundable_amount" | "refunded_total">
    notReady: boolean
    provider_id: string
  },
  { selectby }: SelectOptionsProps
) => {
  const [isLoading, setisLoading] = useState(false)

  const sortOptions = [
    {
      value: "1x",
      label: "1x de R$ 319,00",
    },
    {
      value: "2x",
      label: "2x de R$ 159,50",
    },
    {
      value: "3x",
      label: "3x de R$ 106,33",
    },
  ]

  const handleForm = async (event: React.FormEvent<HTMLFormElement>) => {
    setisLoading(true)
    event.preventDefault() // Prevent default form submission
    const formData = new FormData(event.currentTarget) // Get form data

    const expiryDate = formData.get("Vencimento")
    const [expMonth, expYear] = (expiryDate as string).split("/")
    const fullExpYear = `20${expYear}`

    const cardData = {
      holder: formData.get("holderName"),
      number: formData.get("cardNumber")?.toString()?.replace(/\D/g, ""),
      expMonth: expMonth,
      expYear: fullExpYear,
      securityCode: formData.get("cvv"),
    }

    try {
      let encrypted = null
      //@ts-ignore
      if (window && window.PagSeguro) {
        //@ts-ignore
        const card = PagSeguro.encryptCard({
          publicKey: process.env.NEXT_PUBLIC_PAGBANK_PUBLIC_KEY,
          ...cardData,
        })

        console.log({ cardData })

        encrypted = card.encryptedCard
        const hasErrors = card.hasErrors
        const errors = card.errors

        console.log({ encrypted, errors })

        if (hasErrors) {
          toast.error(errors.map((error: any) => error.message).join(","))
          return
        }

        formData.set("encrypted", encrypted)
      }

      await setPaymentMethod(provider_id)

      console.log("inside valid condition and pagbank payment starts")
      const res = await handlePagbankForm(formData)

      if (res?.status === "PAID") {
        console.log("placeOrder start")
        await placeOrder()
        console.log("placeOrder ends")
      }
      if (res?.error) {
        if (
          res?.error ===
          "An error occurred while processing the payment order, invalid_parameter"
        ) {
          throw new Error("Invalid Card Details")
        } else {
          throw new Error(res?.error)
        }
      }
      console.log("pagbank payment ends")
    } catch (err: any) {
      console.error("Error during payment:", err)
      toast.error(`Error during Pagbank Card payment:${err.message}`)
      // setError("An error occurred during payment: " + err.message)
    } finally {
      setisLoading(false)
    }
  }

  return (
    <>
      <Script src="https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js" />
      <form onSubmit={handleForm} className="flex flex-col gap-4">
        <>
          <div className="relative">
            <InputMask
              component={Input}
              mask="9999 9999 9999 9999"
              replacement={{
                9: /\d/,
              }}
              name="cardNumber"
              label="Card Number"
              required
            />
            <div className="absolute right-2 top-1/2 -translate-y-[50%] text-primary h-max">
              <CreditCard className="h-8 aspect-square" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <InputMask
              mask="99/99"
              name="Vencimento"
              component={Input}
              replacement={{
                9: /\d/,
              }}
              label="Card Expirey"
              autoComplete="true"
              // placeholder="00/00"
              required
              pattern="^\d{2}/\d{2}$"
            />
            <Input
              name="cvv"
              label="CVV"
              required
              type="text"
              inputMode="numeric"
              minLength={3}
              maxLength={4}
            />
          </div>
          <Input
            name="holderName"
            // placeholder="Nome impresso no cartao"
            label="Card Holder Name"
            required
            type="text"
          />
          {/* <InstallmentSelect
            items={sortOptions}
            value={selectby}
            title="Parcelas"
            handleChange={handleSelect}
          /> */}
        </>
        <Button>{isLoading ? <Spinner /> : "Pay with Card"}</Button>
      </form>
    </>
  )
}

export default PagBankPaymentCardButton
