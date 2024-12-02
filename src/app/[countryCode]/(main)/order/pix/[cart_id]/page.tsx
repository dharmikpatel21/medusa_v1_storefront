import PixQrCode from "@/components/common/pix-qr-code"
import { getCart } from "@/lib/data"

import { Metadata } from "next"

export const metadata: Metadata = {
  title: `Pix Payment`,
  description: "Pix Payment",
}

type Props = {
  params: { cart_id: string }
}

const PixPaymentPage = async ({ params: { cart_id } }: Props) => {
  const cart = await getCart(cart_id)

  return (
    <>
      <PixQrCode order={cart} variant="payment" />
    </>
  )
}

export default PixPaymentPage
