import { getCart } from "@/lib/data"
import { Metadata } from "next"
import { notFound } from "next/navigation"

import Boleto from "@/modules/order/components/boleto"

export const metadata: Metadata = {
  title: `Boleto Payment`,
  description: "Boleto Payment Page",
}

type Props = {
  params: { cart_id: string }
}

const PixPaymentPage = async ({ params: { cart_id } }: Props) => {
  const cart = await getCart(cart_id)

  if (!cart) {
    return notFound()
  }

  const barcode =
    (cart?.payment_session?.data as any)?.charges?.[0]?.payment_method?.boleto
      ?.barcode ?? null

  return (
    <>
      {barcode && (
        <Boleto barcode={barcode} cart={cart as any} variant="payment" />
      )}
    </>
  )
}

export default PixPaymentPage
