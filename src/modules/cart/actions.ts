"use server"

import { LineItem } from "@medusajs/medusa"
import { omit } from "lodash"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"

import {
  addItem,
  createCart,
  getCart,
  getProductsById,
  getRegion,
  removeItem,
  updateCart,
  updateItem,
} from "@/lib/data"

/**
 * Retrieves the cart based on the cartId cookie
 *
 * @returns {Promise<Cart>} The cart
 * @example
 * const cart = await getOrSetCart()
 */
export async function getOrSetCart(countryCode: string) {
  const cartId = cookies().get("_medusa_cart_id")?.value
  let cart

  if (cartId) {
    cart = await getCart(cartId).then((cart) => cart)
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const region_id = region.id

  if (!cart) {
    cart = await createCart({ region_id }).then((res) => res)
    cart &&
      cookies().set("_medusa_cart_id", cart.id, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
    revalidateTag("cart")
  }

  if (cart && cart?.region_id !== region_id) {
    await updateCart(cart.id, { region_id })
    revalidateTag("cart")
  }

  return cart
}

export async function retrieveCart() {
  const cartId = cookies().get("_medusa_cart_id")?.value

  if (!cartId) {
    return null
  }

  try {
    const cart = await getCart(cartId).then((cart) => cart)
    return cart
  } catch (e) {
    console.log(e)
    return null
  }
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  const cart = await getOrSetCart(countryCode).then((cart) => cart)

  if (!cart) {
    return "Missing cart ID"
  }

  if (!variantId) {
    return "Missing product variant ID"
  }

  try {
    await addItem({ cartId: cart.id, variantId, quantity })
    revalidateTag("cart")
  } catch (e) {
    return "Error adding item to cart"
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  const cartId = cookies().get("_medusa_cart_id")?.value

  if (!cartId) {
    return "Missing cart ID"
  }

  if (!lineId) {
    return "Missing lineItem ID"
  }

  if (!cartId) {
    return "Missing cart ID"
  }

  try {
    await updateItem({ cartId, lineId, quantity })
    revalidateTag("cart")
  } catch (e: any) {
    return e.toString()
  }
}

export async function deleteLineItem(lineId: string) {
  const cartId = cookies().get("_medusa_cart_id")?.value

  if (!cartId) {
    return "Missing cart ID"
  }

  if (!lineId) {
    return "Missing lineItem ID"
  }

  if (!cartId) {
    return "Missing cart ID"
  }

  try {
    await removeItem({ cartId, lineId })
    revalidateTag("cart")
  } catch (e) {
    return "Error deleting line item"
  }
}

export async function enrichLineItems(
  lineItems: LineItem[],
  regionId: string
): Promise<
  | Omit<LineItem, "beforeInsert" | "beforeUpdate" | "afterUpdateOrLoad">[]
  | undefined
> {
  // Prepare query parameters
  const queryParams = {
    ids: lineItems.map((lineItem) => lineItem.variant.product_id),
    regionId: regionId,
  }

  // Fetch products by their IDs
  const products = await getProductsById(queryParams)

  // If there are no line items or products, return an empty array
  if (!lineItems?.length || !products) {
    return []
  }

  // Enrich line items with product and variant information

  const enrichedItems = lineItems.map((item) => {
    const product = products.find((p) => p.id === item.variant.product_id)
    const variant = product?.variants.find((v) => v.id === item.variant_id)

    // If product or variant is not found, return the original item
    if (!product || !variant) {
      return item
    }

    // If product and variant are found, enrich the item
    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, "variants"),
      },
    }
  }) as LineItem[]

  return enrichedItems
}

export const handlePagbankPayment = async (payload: any) => {
  console.dir({ payload }, { depth: null })

  try {
    console.log("Creating payment")
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/payment/pagbank`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )

    const payment = await response.json()
    console.log({ payment })

    return payment
  } catch (e) {
    console.log({ e })
    return "Error creating payment"
  }
}

export const handlePagbankForm = async (formData: FormData) => {
  console.log("handlePagbankPayment start")

  console.log("handlePagbankPayment called")
  const expiryDate = formData.get("Vencimento")
  const [expMonth, expYear] = (expiryDate as string).split("/")
  const fullExpYear = `20${expYear}`

  const cardnumber = (formData.get("cardNumber") as string).replace(/\s+/g, "")

  const encrypted = formData.get("encrypted")

  const data = {
    holderName: formData.get("holderName"),
    cardNumber: cardnumber,
    expMonth: expMonth,
    expYear: fullExpYear,
    cvv: formData.get("cvv"),
  }

  console.log({ data })

  const cartId = cookies().get("_medusa_cart_id")?.value
  console.log({ cartId })

  if (!cartId) {
    console.log("Missing cart ID")
    return "Missing cart ID"
  }

  const payload = {
    cart_id: cartId,
    payment_info: {
      card: {
        holder: {
          name: data.holderName,
        },
        ...(encrypted
          ? { encrypted: encrypted }
          : {
              number: data.cardNumber,
              exp_month: data.expMonth,
              exp_year: data.expYear,
              security_code: data.cvv,
            }),
      },
    },
    type: "CREDIT_CARD",
  }

  const res = await handlePagbankPayment(payload)
  console.log("handlePagbankPayment ends")

  return res
}

export const handleBoletoForm = async (formData: { [x: string]: any }) => {
  console.log("handlePagbankPayment start")

  console.log("handlePagbankPayment called")

  const formatedTaxId = formData.cpf?.replace(/[.,\-\/]/g, "")
  const data = {
    tax_id: formatedTaxId,
  }

  console.log({ data })

  const cartId = cookies().get("_medusa_cart_id")?.value
  console.log({ cartId })

  if (!cartId) {
    console.log("Missing cart ID")
    return "Missing cart ID"
  }

  const payload = {
    cart_id: cartId,
    payment_info: {
      tax_id: data.tax_id,
    },
    type: "BOLETO",
  }

  const res = await handlePagbankPayment(payload)
  console.dir({ res }, { depth: null })
  console.log("handlePagbankPayment ends")
  if (!res.error) {
    cookies().delete("_medusa_cart_id")
  }

  // if (res?.status === "PAID") {
  //   console.log("placeOrder start")
  //   await placeOrder()
  //   console.log("placeOrder ends")
  // }

  return res
}

export const handlePixPayment = async () => {
  console.log("handlePixPagbankPayment start")
  const cartId = cookies().get("_medusa_cart_id")?.value
  if (!cartId) {
    return null
  }
  const updated_cart = await getCart(cartId).then((cart) => cart)

  if (
    updated_cart?.payment_session?.provider_id === "pagbank-pix" &&
    updated_cart?.payment_session?.data?.qr_codes
  ) {
    console.log(updated_cart?.payment_session?.data?.qr_codes)
    // Handle the case when a valid QR code is available
    cookies().delete("_medusa_cart_id")
    return updated_cart
  } else {
    throw new Error("No valid QR code found.")
  }

  // if (res?.status === "PAID") {
  //   console.log("placeOrder start")
  //   await placeOrder()
  //   console.log("placeOrder ends")
  // }
}

export const updated_cart = async (cartId: string) => {
  const updated_cart = await getCart(cartId).then((cart) => cart)
  return updated_cart
}
