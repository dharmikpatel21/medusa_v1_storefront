"use client"
import { Cart, PaymentSession } from "@medusajs/medusa"
import { placeOrder, setPaymentMethod } from "@modules/checkout/actions"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import PagBankPaymentCardButton from "./pagbank-payment-card-button"
import PagBankPixPaymentButton from "./pagbank-payment-pix-button"
import PagBankBoletoPaymentButton from "./pagbank-payment-boleto-button"
import { Button } from "@medusajs/ui"
import Spinner from "@/modules/common/icons/spinner"

type PaymentButtonProps = {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
  provider_id?: string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ cart, provider_id }) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    cart.shipping_methods.length < 1
      ? true
      : false

  const paymentSession = cart.payment_session as PaymentSession

  switch (provider_id) {
    case "stripe":
      return <StripePaymentButton notReady={notReady} cart={cart} />
    case "manual":
      return (
        <ManualTestPaymentButton
          notReady={notReady}
          provider_id={provider_id}
        />
      )
    case "pagbank":
      return (
        <PagBankPaymentCardButton
          notReady={notReady}
          cart={cart}
          provider_id={provider_id}
        />
      )
    case "pagbank-pix":
      return (
        <PagBankPixPaymentButton
          notReady={notReady}
          cart={cart}
          provider_id={provider_id}
        />
      )
    case "pagbank-boleto":
      return (
        <PagBankBoletoPaymentButton
          notReady={notReady}
          cart={cart}
          provider_id={provider_id}
        />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
}: {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
  notReady: boolean
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder().catch(() => {
      setErrorMessage("An error occurred, please try again.")
      setSubmitting(false)
    })
  }

  // const stripe = useStripe()
  // const elements = useElements()
  // const card = elements?.getElement("card")

  // const session = cart.payment_session as PaymentSession

  // const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    // if (!stripe || !elements || !card || !cart) {
    //   setSubmitting(false)
    //   return
    // }

    // await stripe
    //   .confirmCardPayment(session.data.client_secret as string, {
    //     payment_method: {
    //       card: card,
    //       billing_details: {
    //         name:
    //           cart.billing_address.first_name +
    //           " " +
    //           cart.billing_address.last_name,
    //         address: {
    //           city: cart.billing_address.city ?? undefined,
    //           country: cart.billing_address.country_code ?? undefined,
    //           line1: cart.billing_address.address_1 ?? undefined,
    //           line2: cart.billing_address.address_2 ?? undefined,
    //           postal_code: cart.billing_address.postal_code ?? undefined,
    //           state: cart.billing_address.province ?? undefined,
    //         },
    //         email: cart.email,
    //         phone: cart.billing_address.phone ?? undefined,
    //       },
    //     },
    //   })
    //   .then(({ error, paymentIntent }) => {
    //     if (error) {
    //       const pi = error.payment_intent

    //       if (
    //         (pi && pi.status === "requires_capture") ||
    //         (pi && pi.status === "succeeded")
    //       ) {
    //         onPaymentCompleted()
    //       }

    //       setErrorMessage(error.message || null)
    //       return
    //     }

    //     if (
    //       (paymentIntent && paymentIntent.status === "requires_capture") ||
    //       paymentIntent.status === "succeeded"
    //     ) {
    //       return onPaymentCompleted()
    //     }

    //     return
    //   })
  }

  return (
    <>
      <Button
        disabled={notReady}
        onClick={handlePayment}
        size="large"
        className="p-2"
      >
        {submitting ? (
          <Spinner className="border-white border-l-transparent" />
        ) : (
          "Place order"
        )}
      </Button>
      <ErrorMessage error={errorMessage} />
    </>
  )
}

const PayPalPaymentButton = ({
  cart,
  notReady,
}: {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
  notReady: boolean
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder().catch(() => {
      setErrorMessage("An error occurred, please try again.")
      setSubmitting(false)
    })
  }

  const session = cart.payment_session as PaymentSession
}

const ManualTestPaymentButton = ({
  notReady,
  provider_id,
}: {
  notReady: boolean
  provider_id: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await setPaymentMethod(provider_id).catch((err) =>
      setErrorMessage(err.toString())
    )

    await placeOrder().catch((err) => {
      setErrorMessage(err.toString())
      setSubmitting(false)
    })
  }

  const handlePayment = async () => {
    try {
      setSubmitting(true)

      onPaymentCompleted()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Button
        disabled={notReady}
        // isLoading={submitting}
        onClick={handlePayment}
        size="large"
      >
        Place order
      </Button>
      <ErrorMessage error={errorMessage} />
    </>
  )
}
export default PaymentButton

// "use client"

// import { Cart, PaymentSession } from "@medusajs/medusa"
// import { Button } from "@medusajs/ui"
// import { OnApproveActions, OnApproveData } from "@paypal/paypal-js"
// import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
// import { useElements, useStripe } from "@stripe/react-stripe-js"
// import { placeOrder } from "@modules/checkout/actions"
// import React, { useState } from "react"
// import ErrorMessage from "../error-message"
// import Spinner from "@modules/common/icons/spinner"

// type PaymentButtonProps = {
//   cart: Omit<Cart, "refundable_amount" | "refunded_total">
// }

// const PaymentButton: React.FC<PaymentButtonProps> = ({ cart }) => {
//   const notReady =
//     !cart ||
//     !cart.shipping_address ||
//     !cart.billing_address ||
//     !cart.email ||
//     cart.shipping_methods.length < 1
//       ? true
//       : false

//   const paymentSession = cart.payment_session as PaymentSession

//   switch (paymentSession.provider_id) {
//     case "stripe":
//       return <StripePaymentButton notReady={notReady} cart={cart} />
//     case "manual":
//       return <ManualTestPaymentButton notReady={notReady} />
//     case "paypal":
//       return <PayPalPaymentButton notReady={notReady} cart={cart} />
//     default:
//       return <Button disabled>Select a payment method</Button>
//   }
// }

// const StripePaymentButton = ({
//   cart,
//   notReady,
// }: {
//   cart: Omit<Cart, "refundable_amount" | "refunded_total">
//   notReady: boolean
// }) => {
//   const [submitting, setSubmitting] = useState(false)
//   const [errorMessage, setErrorMessage] = useState<string | null>(null)

//   const onPaymentCompleted = async () => {
//     await placeOrder().catch(() => {
//       setErrorMessage("An error occurred, please try again.")
//       setSubmitting(false)
//     })
//   }

//   const stripe = useStripe()
//   const elements = useElements()
//   const card = elements?.getElement("card")

//   const session = cart.payment_session as PaymentSession

//   const disabled = !stripe || !elements ? true : false

//   const handlePayment = async () => {
//     setSubmitting(true)

//     if (!stripe || !elements || !card || !cart) {
//       setSubmitting(false)
//       return
//     }

//     await stripe
//       .confirmCardPayment(session.data.client_secret as string, {
//         payment_method: {
//           card: card,
//           billing_details: {
//             name:
//               cart.billing_address.first_name +
//               " " +
//               cart.billing_address.last_name,
//             address: {
//               city: cart.billing_address.city ?? undefined,
//               country: cart.billing_address.country_code ?? undefined,
//               line1: cart.billing_address.address_1 ?? undefined,
//               line2: cart.billing_address.address_2 ?? undefined,
//               postal_code: cart.billing_address.postal_code ?? undefined,
//               state: cart.billing_address.province ?? undefined,
//             },
//             email: cart.email,
//             phone: cart.billing_address.phone ?? undefined,
//           },
//         },
//       })
//       .then(({ error, paymentIntent }) => {
//         if (error) {
//           const pi = error.payment_intent

//           if (
//             (pi && pi.status === "requires_capture") ||
//             (pi && pi.status === "succeeded")
//           ) {
//             onPaymentCompleted()
//           }

//           setErrorMessage(error.message || null)
//           return
//         }

//         if (
//           (paymentIntent && paymentIntent.status === "requires_capture") ||
//           paymentIntent.status === "succeeded"
//         ) {
//           return onPaymentCompleted()
//         }

//         return
//       })
//   }

//   return (
//     <>
//       <Button
//         disabled={disabled || notReady}
//         onClick={handlePayment}
//         size="large"
//         isLoading={submitting}
//       >
//         Place order
//       </Button>
//       <ErrorMessage error={errorMessage} />
//     </>
//   )
// }

// const PayPalPaymentButton = ({
//   cart,
//   notReady,
// }: {
//   cart: Omit<Cart, "refundable_amount" | "refunded_total">
//   notReady: boolean
// }) => {
//   const [submitting, setSubmitting] = useState(false)
//   const [errorMessage, setErrorMessage] = useState<string | null>(null)

//   const onPaymentCompleted = async () => {
//     await placeOrder().catch(() => {
//       setErrorMessage("An error occurred, please try again.")
//       setSubmitting(false)
//     })
//   }

//   const session = cart.payment_session as PaymentSession

//   const handlePayment = async (
//     _data: OnApproveData,
//     actions: OnApproveActions
//   ) => {
//     actions?.order
//       ?.authorize()
//       .then((authorization) => {
//         if (authorization.status !== "COMPLETED") {
//           setErrorMessage(`An error occurred, status: ${authorization.status}`)
//           return
//         }
//         onPaymentCompleted()
//       })
//       .catch(() => {
//         setErrorMessage(`An unknown error occurred, please try again.`)
//         setSubmitting(false)
//       })
//   }

//   const [{ isPending, isResolved }] = usePayPalScriptReducer()

//   if (isPending) {
//     return <Spinner />
//   }

//   if (isResolved) {
//     return (
//       <>
//         <PayPalButtons
//           style={{ layout: "horizontal" }}
//           createOrder={async () => session.data.id as string}
//           onApprove={handlePayment}
//           disabled={notReady || submitting || isPending}
//         />
//         <ErrorMessage error={errorMessage} />
//       </>
//     )
//   }
// }

// const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
//   const [submitting, setSubmitting] = useState(false)
//   const [errorMessage, setErrorMessage] = useState<string | null>(null)

//   const onPaymentCompleted = async () => {
//     await placeOrder().catch((err) => {
//       setErrorMessage(err.toString())
//       setSubmitting(false)
//     })
//   }

//   const handlePayment = () => {
//     setSubmitting(true)

//     onPaymentCompleted()
//   }

//   return (
//     <>
//       <Button
//         disabled={notReady}
//         isLoading={submitting}
//         onClick={handlePayment}
//         size="large"
//       >
//         Place order
//       </Button>
//       <ErrorMessage error={errorMessage} />
//     </>
//   )
// }

// export default PaymentButton
